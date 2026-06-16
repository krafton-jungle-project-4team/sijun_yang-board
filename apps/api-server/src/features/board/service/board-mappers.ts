import type { Comment, PostDetail, PostSummary, Tag } from "@nmm/shared";

import type {
    IGetPostByIdResult,
    IListCommentsByPostIdResult,
    IListPostsResult,
    IListTagsByPostIdsResult,
    IListTagsResult
} from "../database/__generated__/board.queries";

type TagRow = IListTagsResult | IListTagsByPostIdsResult;
type PostRow = IListPostsResult | IGetPostByIdResult;

export function toTagModel(tag: TagRow): Tag {
    return {
        id: tag.id,
        name: tag.name
    };
}

export function toPostSummary(post: PostRow, tags: Tag[] = []): PostSummary {
    const excerpt = post.content.length > 160 ? `${post.content.slice(0, 157)}...` : post.content;

    return {
        id: post.id,
        title: post.title,
        excerpt,
        authorId: post.authorId,
        authorName: post.authorName,
        commentCount: post.commentCount ?? 0,
        viewCount: post.viewCount,
        tags,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
    };
}

export function toPostDetail(post: IGetPostByIdResult, tags: Tag[] = []): PostDetail {
    return {
        ...toPostSummary(post, tags),
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
