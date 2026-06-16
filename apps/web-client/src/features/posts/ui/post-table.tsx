import type { PostSummary, User } from "@nmm/shared";
import {
    Button,
    ButtonGroup,
    Card,
    CardDescription,
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

import { canManagePost } from "../model/post-permissions";

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
                            <TableHead>Announcement</TableHead>
                            <TableHead className="hidden md:table-cell">Author</TableHead>
                            <TableHead className="hidden lg:table-cell">Activity</TableHead>
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
                    <Link to="/posts/$postId" params={{ postId: String(post.id) }}>
                        {post.title}
                    </Link>
                    <CardDescription className="line-clamp-1">{post.excerpt}</CardDescription>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{post.authorName}</TableCell>
            <TableCell className="hidden lg:table-cell">
                {post.commentCount} comments · {post.viewCount} views
            </TableCell>
            {hasActionColumn ? (
                <TableCell>
                    <ButtonGroup className="ml-auto">
                        {canEdit ? (
                            <Button asChild size="icon" variant="ghost" aria-label="Edit post">
                                <Link to="/posts/$postId/edit" params={{ postId: String(post.id) }}>
                                    <Pencil />
                                </Link>
                            </Button>
                        ) : null}
                    </ButtonGroup>
                </TableCell>
            ) : null}
        </TableRow>
    );
}
