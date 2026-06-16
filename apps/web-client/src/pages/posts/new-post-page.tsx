import type { CreatePostInput } from "@nmm/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate } from "@tanstack/react-router";

import { PostForm, useCreatePost, usePostTags } from "../../features/posts";

export function NewPostPage() {
    const navigate = useNavigate();
    const createPost = useCreatePost();
    const tagsQuery = usePostTags();
    const availableTags = tagsQuery.data ?? [];

    async function handleSubmit(input: CreatePostInput) {
        const result = await createPost.mutateAsync(input);

        await navigate({ to: "/posts/$postId", params: { postId: String(result.id) } });
    }

    function handleCancel() {
        void navigate({ to: "/posts" });
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <h1>New post</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Post details</CardTitle>
                </CardHeader>
                <CardContent>
                    <PostForm
                        availableTags={availableTags}
                        pending={createPost.isPending}
                        submitLabel="Create"
                        onCancel={handleCancel}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
