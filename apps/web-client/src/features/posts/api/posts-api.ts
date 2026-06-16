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
import type { Options } from "ky";
import { z } from "zod";

import { deleteJson, getJson, patchJson, postJson } from "../../../shared/api/http-client";

const commentsSchema = z.array(commentSchema);

export const postsApi = {
    listPosts(query: PostListQuery, options?: Options) {
        return getJson("posts", postListResultSchema, {
            ...options,
            searchParams: toPostSearchParams(query)
        });
    },
    getPost(postId: number, options?: Options) {
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
    listComments(postId: number, options?: Options) {
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

function toPostSearchParams(query: PostListQuery) {
    const searchParams = new URLSearchParams({
        page: String(query.page),
        pageSize: String(query.pageSize),
        sort: query.sort,
        view: query.view
    });

    if (query.search) {
        searchParams.set("search", query.search);
    }

    return searchParams;
}
