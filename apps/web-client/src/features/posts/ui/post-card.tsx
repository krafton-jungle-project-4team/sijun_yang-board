import type { PostSummary } from "@nmm/shared";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";

type PostCardProps = {
    post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Link to="/posts/$postId" params={{ postId: String(post.id) }}>
                        {post.title}
                    </Link>
                </CardTitle>
                <p className="muted">
                    {post.authorName} · {post.commentCount} comments · {post.viewCount} views
                </p>
            </CardHeader>
            <CardContent>
                <p>{post.excerpt}</p>
                <div className="button-row">
                    {post.tags.map((tag) => (
                        <Badge key={tag.id}>{tag.name}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
