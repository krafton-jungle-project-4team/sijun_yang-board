import type { CreatePostInput } from "@nmm/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate, useParams } from "@tanstack/react-router";

import { PostForm, usePost, useUpdatePost } from "../../features/posts";

export function EditPostPage() {
    const navigate = useNavigate();
    const params = useParams({ strict: false }) as { postId: string };
    const postId = Number(params.postId);
    const postQuery = usePost(postId);
    const updatePost = useUpdatePost(postId);

    async function handleSubmit(input: CreatePostInput) {
        await updatePost.mutateAsync(input);
        await navigate({ to: "/posts/$postId", params: { postId: String(postId) } });
    }

    if (postQuery.isPending) {
        return <p className="muted">Loading post...</p>;
    }

    if (postQuery.isError) {
        return <p className="muted">Could not load post.</p>;
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <h1>Edit post</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Post details</CardTitle>
                </CardHeader>
                <CardContent>
                    <PostForm
                        initialValue={{
                            title: postQuery.data.title,
                            content: postQuery.data.content,
                            tags: postQuery.data.tags.map((tag) => tag.name)
                        }}
                        pending={updatePost.isPending}
                        submitLabel="Save"
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
