import type { CreatePostInput } from "@nmm/shared";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { useCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { useDeletePost, usePost, useUpdatePost } from "../../features/posts/hooks/use-posts";
import { canManagePost } from "../../features/posts/model/post-permissions";
import { PostForm } from "../../features/posts/ui/post-form";

export function EditPostPage() {
    const navigate = useNavigate();
    const params = useParams({ strict: false }) as { postId: string };
    const postId = Number(params.postId);
    const currentUserQuery = useCurrentUserQuery();
    const postQuery = usePost(postId);
    const updatePost = useUpdatePost(postId);
    const deletePost = useDeletePost(postId);

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
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid post.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (postQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Loading post...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (postQuery.isError) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Could not load post.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (currentUserQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Checking permissions...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!canManagePost(currentUserQuery.data, postQuery.data)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Edit unavailable</CardTitle>
                    <CardDescription>Author or admin only.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <CardHeader className="px-0">
                    <CardTitle>Edit announcement</CardTitle>
                    <CardDescription>Update or remove this announcement.</CardDescription>
                </CardHeader>
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
                    <CardTitle>Announcement details</CardTitle>
                </CardHeader>
                <CardContent>
                    <PostForm
                        initialValue={{
                            title: postQuery.data.title,
                            content: postQuery.data.content
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
