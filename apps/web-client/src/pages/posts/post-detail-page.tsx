import { Badge, Button, Card, CardContent, Separator } from "@nmm/ui/components";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";

import { useCurrentUserQuery } from "../../features/auth";
import { canManagePost, PostComments, PostTagBadges, usePost } from "../../features/posts";

export function PostDetailPage() {
    const params = useParams({ strict: false }) as { postId: string };
    const postId = Number(params.postId);
    const currentUser = useCurrentUserQuery().data;
    const postQuery = usePost(postId);

    if (!Number.isInteger(postId) || postId <= 0) {
        return <p className="muted">Invalid post.</p>;
    }

    if (postQuery.isPending) {
        return <p className="muted">Loading post...</p>;
    }

    if (postQuery.isError) {
        return <p className="muted">Could not load post.</p>;
    }

    const post = postQuery.data;
    const canEdit = canManagePost(currentUser, post);

    return (
        <article className="page-stack">
            <div className="flex items-center justify-between gap-3">
                <Button asChild variant="ghost">
                    <Link to="/posts">
                        <ArrowLeft />
                        Posts
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

            <div className="grid gap-3">
                <Badge variant="secondary">{post.authorName}</Badge>
                <h1 className="text-2xl font-semibold tracking-normal">{post.title}</h1>
                <p className="text-muted-foreground">
                    {post.commentCount} comments · {post.viewCount} views
                </p>
                <PostTagBadges tags={post.tags} />
            </div>

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
