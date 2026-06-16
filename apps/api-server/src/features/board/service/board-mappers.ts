import type { Comment, PostDetail, PostSummary } from "@nmm/shared";

import type {
    IGetPostByIdResult,
    IListCommentsByPostIdResult,
    IListPostsResult
} from "../database/__generated__/board.queries";

type PostRow = IListPostsResult | IGetPostByIdResult;

export function toPostSummary(post: PostRow): PostSummary {
    const excerpt = post.content.length > 160 ? `${post.content.slice(0, 157)}...` : post.content;

    return {
        id: post.id,
        title: post.title,
        excerpt,
        authorId: post.authorId,
        authorName: post.authorName,
        commentCount: post.commentCount ?? 0,
        viewCount: post.viewCount,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
    };
}

export function toPostDetail(post: IGetPostByIdResult): PostDetail {
    return {
        ...toPostSummary(post),
        content: post.content
    };
}

export function toCommentModel(comment: IListCommentsByPostIdResult): Comment {
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
