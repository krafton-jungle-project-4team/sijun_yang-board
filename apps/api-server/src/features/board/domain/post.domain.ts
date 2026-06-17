import type { PostDetail, PostSummary } from "@nmm/shared";

import type { AuthClaims } from "@/features/auth";

export interface PostSnapshot {
    id: number;
    title: string;
    content: string;
    authorId: number;
    authorName: string;
    commentCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export const PostDomain = {
    canMutate(post: Pick<PostSnapshot, "authorId">, auth: AuthClaims) {
        return auth.role === "ADMIN" || auth.userId === post.authorId;
    },
    toSummary(post: PostSnapshot): PostSummary {
        return {
            id: post.id,
            title: post.title,
            excerpt: createExcerpt(post.content),
            authorId: post.authorId,
            authorName: post.authorName,
            commentCount: post.commentCount,
            viewCount: post.viewCount,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },
    toDetail(post: PostSnapshot): PostDetail {
        return {
            ...PostDomain.toSummary(post),
            content: post.content
        };
    }
};

export interface PostMutationTarget {
    id: number;
    authorId: number;
}

export interface PostMutationResult {
    post: PostMutationTarget;
    changedId: number | null;
}

function createExcerpt(content: string) {
    return content.length > 160 ? `${content.slice(0, 157)}...` : content;
}
