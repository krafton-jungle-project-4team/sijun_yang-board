import type { Comment, PostDetail, PostSummary, User } from "@nmm/shared";

import { isSignedInUser } from "@/features/auth/model/current-user";

export function canManagePost(user: User | null | undefined, post: Pick<PostSummary | PostDetail, "authorId">) {
    return isSignedInUser(user) && (user.role === "ADMIN" || user.id === post.authorId);
}

export function canManageComment(user: User | null | undefined, comment: Pick<Comment, "authorId">) {
    return isSignedInUser(user) && (user.role === "ADMIN" || user.id === comment.authorId);
}
