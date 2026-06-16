import { Button, Card, CardContent, CardHeader, CardTitle } from "@nmm/ui/components";
import { Link, useParams } from "@tanstack/react-router";

import { usePost } from "../../features/posts";

export function PostDetailPage() {
    const params = useParams({ strict: false }) as { postId: string };
    const postId = Number(params.postId);
    const postQuery = usePost(postId);

    if (postQuery.isPending) {
        return <p className="muted">Loading post...</p>;
    }

    if (postQuery.isError) {
        return <p className="muted">Could not load post.</p>;
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <div>
                    <h1>{postQuery.data.title}</h1>
                    <p>
                        {postQuery.data.authorName} · {postQuery.data.viewCount} views
                    </p>
                </div>
                <Button asChild variant="secondary">
                    <Link to="/posts/$postId/edit" params={{ postId: String(postQuery.data.id) }}>
                        Edit
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{postQuery.data.content}</p>
                </CardContent>
            </Card>
        </div>
    );
}
