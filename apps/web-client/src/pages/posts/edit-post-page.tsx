import type { CreatePostInput } from "@nmm/shared";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { useCurrentUserQuery } from "../../features/auth";
import { canManagePost, PostForm, useDeletePost, usePost, usePostTags, useUpdatePost } from "../../features/posts";

export function EditPostPage() {
    const navigate = useNavigate();
    const params = useParams({ strict: false }) as { postId: string };
    const postId = Number(params.postId);
    const currentUserQuery = useCurrentUserQuery();
    const postQuery = usePost(postId);
    const tagsQuery = usePostTags();
    const updatePost = useUpdatePost(postId);
    const deletePost = useDeletePost(postId);
    const availableTags = tagsQuery.data ?? [];

    async function handleSubmit(input: CreatePostInput) {
        await updatePost.mutateAsync(input);
        await navigate({ to: "/posts/$postId", params: { postId: String(postId) } });
    }

    async function handleDeleteClick() {
        await deletePost.mutateAsync();
        await navigate({ to: "/posts" });
    }

    function handleCancel() {
        void navigate({ to: "/posts/$postId", params: { postId: String(postId) } });
    }

    if (!Number.isInteger(postId) || postId <= 0) {
        return <p className="muted">Invalid post.</p>;
    }

    if (postQuery.isPending) {
        return <p className="muted">Loading post...</p>;
    }

    if (postQuery.isError) {
        return <p className="muted">Could not load post.</p>;
    }

    if (currentUserQuery.isPending) {
        return <p className="muted">Checking permissions...</p>;
    }

    if (!canManagePost(currentUserQuery.data, postQuery.data)) {
        return (
            <div className="page-stack">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit unavailable</CardTitle>
                        <CardDescription>Only the author or an admin can edit this post.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <div className="grid gap-1">
                    <h1>Edit post</h1>
                    <p className="muted">Update content, tags, or remove the post.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    disabled={deletePost.isPending || updatePost.isPending}
                    onClick={handleDeleteClick}
                >
                    <Trash2 />
                    Delete
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Post details</CardTitle>
                </CardHeader>
                <CardContent>
                    <PostForm
                        availableTags={availableTags}
                        initialValue={{
                            title: postQuery.data.title,
                            content: postQuery.data.content,
                            tags: postQuery.data.tags.map((tag) => tag.name)
                        }}
                        pending={updatePost.isPending}
                        submitLabel="Save"
                        onCancel={handleCancel}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
