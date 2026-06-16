import type { Comment, PostDetail, PostSummary, User } from "@nmm/shared";

import { isActiveUser } from "../../auth/model/user-status";

export function canManagePost(user: User | null | undefined, post: Pick<PostSummary | PostDetail, "authorId">) {
    return isActiveUser(user) && (user.role === "ADMIN" || user.id === post.authorId);
}

export function canManageComment(user: User | null | undefined, comment: Pick<Comment, "authorId">) {
    return isActiveUser(user) && (user.role === "ADMIN" || user.id === comment.authorId);
}
