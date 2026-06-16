import {
    commentSchema,
    idCommandResultSchema,
    postDetailSchema,
    postListResultSchema,
    tagSchema,
    type CreateCommentInput,
    type CreatePostInput,
    type PostListQuery,
    type UpdatePostInput
} from "@nmm/shared";
import { z } from "zod";

import { deleteJson, getJson, patchJson, postJson } from "../../../shared/api/http-client";

const commentsSchema = z.array(commentSchema);
const tagsSchema = z.array(tagSchema);

export const postsApi = {
    listPosts(query: PostListQuery) {
        return getJson("posts", postListResultSchema, {
            searchParams: query
        });
    },
    getPost(postId: number) {
        return getJson(`posts/${postId}`, postDetailSchema);
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
    listComments(postId: number) {
        return getJson(`posts/${postId}/comments`, commentsSchema);
    },
    createComment(postId: number, input: CreateCommentInput) {
        return postJson(`posts/${postId}/comments`, idCommandResultSchema, input);
    },
    listTags() {
        return getJson("post-tags", tagsSchema);
    }
};
