import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Separator
} from "@nmm/ui/components";
import { Link, useParams } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { Suspense } from "react";

import { SectionSkeleton } from "@/app/section-skeleton";
import { useCurrentUserQuery } from "@/features/auth/api/auth-queries";
import { useSuspensePost } from "@/features/posts/hooks/use-posts";
import { canManagePost } from "@/features/posts/model/post-permissions";
import { PostComments } from "@/features/posts/ui/post-comments";

export function PostDetailPage() {
    const params = useParams({ strict: false }) as { postId: string };
    const postId = Number(params.postId);

    if (!Number.isInteger(postId) || postId <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid post.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return <PostDetailContent postId={postId} />;
}

function PostDetailContent({ postId }: { postId: number }) {
    const currentUser = useCurrentUserQuery().data;
    const post = useSuspensePost(postId).data;
    const canEdit = canManagePost(currentUser, post);

    return (
        <article className="grid gap-5">
            {canEdit ? (
                <div className="flex justify-end">
                    <Button asChild variant="outline">
                        <Link to="/posts/$postId/edit" params={{ postId: String(post.id) }}>
                            <Pencil />
                            Edit
                        </Link>
                    </Button>
                </div>
            ) : null}

            <CardHeader className="px-0">
                <Badge variant="secondary">{post.authorName}</Badge>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                    {post.commentCount} comments · {post.viewCount} views
                </CardDescription>
            </CardHeader>

            <Separator />
            <Card>
                <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-7">{post.content}</p>
                </CardContent>
            </Card>

            <Suspense fallback={<SectionSkeleton title="Comments" description="Loading comments..." rows={2} />}>
                <PostComments currentUser={currentUser} postId={post.id} />
            </Suspense>
        </article>
    );
}
