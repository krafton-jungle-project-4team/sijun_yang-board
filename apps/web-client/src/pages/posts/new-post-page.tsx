import type { CreatePostInput } from "@nmm/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate } from "@tanstack/react-router";

import { showResourceCreatedFlashbar } from "@/app/app-flashbar-store";
import { useCreatePost } from "@/features/posts/hooks/use-posts";
import { PostForm } from "@/features/posts/ui/post-form";

export function NewPostPage() {
    const navigate = useNavigate();
    const createPost = useCreatePost();

    async function handleSubmit(input: CreatePostInput) {
        const result = await createPost.mutateAsync(input);

        await navigate({ to: "/posts/$postId", params: { postId: String(result.id) } });
        showResourceCreatedFlashbar("Announcement");
    }

    function handleCancel() {
        void navigate({ to: "/posts" });
    }

    return (
        <div className="grid gap-5">
            <CardHeader className="px-0">
                <CardTitle>New announcement</CardTitle>
            </CardHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Announcement details</CardTitle>
                </CardHeader>
                <CardContent>
                    <PostForm
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
