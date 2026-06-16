import { Button } from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";

import { PostCard, usePosts } from "../../features/posts";

const defaultQuery = {
    page: 1,
    pageSize: 20,
    sort: "latest",
    view: "all"
} as const;

export function PostsPage() {
    const postsQuery = usePosts(defaultQuery);

    if (postsQuery.isPending) {
        return <p className="muted">Loading posts...</p>;
    }

    if (postsQuery.isError) {
        return <p className="muted">Could not load posts.</p>;
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <div>
                    <h1>Posts</h1>
                    <p>{postsQuery.data.total} posts</p>
                </div>
                <Button asChild>
                    <Link to="/posts/new">New post</Link>
                </Button>
            </div>
            <div className="grid-list">
                {postsQuery.data.items.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
