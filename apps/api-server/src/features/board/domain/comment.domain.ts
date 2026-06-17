import type { Comment } from "@nmm/shared";

import type { AuthClaims } from "@/features/auth";

export interface CommentSnapshot {
    id: number;
    postId: number;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export const CommentDomain = {
    canMutate(comment: Pick<CommentSnapshot, "authorId">, auth: AuthClaims) {
        return auth.role === "ADMIN" || auth.userId === comment.authorId;
    },
    toComment(comment: CommentSnapshot): Comment {
        return {
            id: comment.id,
            postId: comment.postId,
            authorId: comment.authorId,
            authorName: comment.authorName,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
        };
    }
};

export interface CommentMutationTarget {
    id: number;
    authorId: number;
}

export interface CommentMutationResult {
    comment: CommentMutationTarget;
    changedId: number | null;
}
