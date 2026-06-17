import {
    commentSchema,
    idCommandResultSchema,
    postDetailSchema,
    postListResultSchema,
    type CreateCommentInput,
    type CreatePostInput,
    type PostListQuery,
    type UpdateCommentInput,
    type UpdatePostInput
} from "@nmm/shared";
import { z } from "zod";

import { deleteJson, getJson, patchJson, postJson, type RequestOptions } from "@/shared/api/http-client";
import { serializePostListQuery } from "@/features/posts/model/post-search";

const commentsSchema = z.array(commentSchema);

export const postsApi = {
    listPosts(query: PostListQuery, options?: RequestOptions) {
        return getJson("posts", postListResultSchema, {
            ...options,
            searchParams: serializePostListQuery(query)
        });
    },
    getPost(postId: number, options?: RequestOptions) {
        return getJson(`posts/${postId}`, postDetailSchema, options);
    },
    createPost(input: CreatePostInput) {
        return postJson("posts", idCommandResultSchema, input);
    },
    updatePost(postId: number, input: UpdatePostInput) {
        return patchJson(`posts/${postId}`, idCommandResultSchema, input);
    },
    deletePost(postId: number) {
        return deleteJson(`posts/${postId}`, idCommandResultSchema);
    },
    listComments(postId: number, options?: RequestOptions) {
        return getJson(`posts/${postId}/comments`, commentsSchema, options);
    },
    createComment(postId: number, input: CreateCommentInput) {
        return postJson(`posts/${postId}/comments`, idCommandResultSchema, input);
    },
    updateComment(commentId: number, input: UpdateCommentInput) {
        return patchJson(`comments/${commentId}`, idCommandResultSchema, input);
    },
    deleteComment(commentId: number) {
        return deleteJson(`comments/${commentId}`, idCommandResultSchema);
    }
};
