import type { PostSummary, User } from "@nmm/shared";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";

import { canManagePost } from "../model";
import { PostTagBadges } from "./post-tag-badges";

type PostCardsProps = {
    currentUser: User | null | undefined;
    posts: PostSummary[];
};

export function PostCards({ currentUser, posts }: PostCardsProps) {
    return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) =>
                canManagePost(currentUser, post) ? (
                    <ManageablePostCard key={post.id} post={post} />
                ) : (
                    <ReadonlyPostCard key={post.id} post={post} />
                )
            )}
        </div>
    );
}

type PostCardProps = {
    post: PostSummary;
};

function ReadonlyPostCard({ post }: PostCardProps) {
    return (
        <Card>
            <PostCardContent post={post} />
        </Card>
    );
}

function ManageablePostCard({ post }: PostCardProps) {
    return (
        <Card>
            <PostCardContent post={post} />
            <CardFooter className="justify-end gap-2">
                <Button asChild size="icon" variant="ghost" aria-label="Edit post">
                    <Link to="/posts/$postId/edit" params={{ postId: String(post.id) }}>
                        <Pencil />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function PostCardContent({ post }: PostCardProps) {
    return (
        <>
            <CardHeader>
                <CardTitle>
                    <Link to="/posts/$postId" params={{ postId: String(post.id) }} className="hover:underline">
                        {post.title}
                    </Link>
                </CardTitle>
                <CardDescription>
                    {post.authorName} · {post.commentCount} comments · {post.viewCount} views
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    <p className="text-muted-foreground line-clamp-3 text-sm">{post.excerpt}</p>
                    <PostTagBadges tags={post.tags} />
                </div>
            </CardContent>
        </>
    );
}
