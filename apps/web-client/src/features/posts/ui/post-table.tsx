import type { PostSummary, User } from "@nmm/shared";
import {
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";

import { canManagePost } from "../model";
import { PostTagBadges } from "./post-tag-badges";

type PostTableProps = {
    currentUser: User | null | undefined;
    posts: PostSummary[];
};

export function PostTable({ currentUser, posts }: PostTableProps) {
    const hasManageablePost = posts.some((post) => canManagePost(currentUser, post));

    return (
        <Card className="gap-0 py-0">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="hidden md:table-cell">Author</TableHead>
                            {hasManageablePost ? <TableHead className="w-20 text-right">Actions</TableHead> : null}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.map((post) => (
                            <PostTableRow
                                key={post.id}
                                currentUser={currentUser}
                                hasActionColumn={hasManageablePost}
                                post={post}
                            />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

type PostTableRowProps = {
    currentUser: User | null | undefined;
    hasActionColumn: boolean;
    post: PostSummary;
};

function PostTableRow({ currentUser, hasActionColumn, post }: PostTableRowProps) {
    const canEdit = canManagePost(currentUser, post);

    return (
        <TableRow>
            <TableCell>
                <div className="grid gap-1">
                    <Link
                        to="/posts/$postId"
                        params={{ postId: String(post.id) }}
                        className="font-medium hover:underline"
                    >
                        {post.title}
                    </Link>
                    <p className="text-muted-foreground line-clamp-1 text-sm">{post.excerpt}</p>
                    <PostTagBadges tags={post.tags} />
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{post.authorName}</TableCell>
            {hasActionColumn ? (
                <TableCell>
                    <div className="flex justify-end">
                        {canEdit ? (
                            <Button asChild size="icon" variant="ghost" aria-label="Edit post">
                                <Link to="/posts/$postId/edit" params={{ postId: String(post.id) }}>
                                    <Pencil />
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </TableCell>
            ) : null}
        </TableRow>
    );
}
