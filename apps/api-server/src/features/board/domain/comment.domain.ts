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
