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
import { ArrowLeft, Pencil } from "lucide-react";

import { useCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { usePost } from "../../features/posts/hooks/use-posts";
import { canManagePost } from "../../features/posts/model/post-permissions";
import { PostComments } from "../../features/posts/ui/post-comments";

export function PostDetailPage() {
    const params = useParams({ strict: false }) as { postId: string };
    const postId = Number(params.postId);
    const currentUser = useCurrentUserQuery().data;
    const postQuery = usePost(postId);

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

    const post = postQuery.data;
    const canEdit = canManagePost(currentUser, post);

    return (
        <article className="grid gap-5">
            <div className="flex items-center justify-between gap-3">
                <Button asChild variant="ghost">
                    <Link to="/posts">
                        <ArrowLeft />
                        Announcements
                    </Link>
                </Button>
                {canEdit ? (
                    <Button asChild variant="outline">
                        <Link to="/posts/$postId/edit" params={{ postId: String(post.id) }}>
                            <Pencil />
                            Edit
                        </Link>
                    </Button>
                ) : null}
            </div>

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

            <PostComments currentUser={currentUser} postId={post.id} />
        </article>
    );
}
