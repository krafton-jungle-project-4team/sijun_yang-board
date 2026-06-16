import type { CreateCommentInput, PostListQuery, UpdateCommentInput, UpdatePostInput } from "@nmm/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "../../dashboard/hooks/use-dashboard";
import { postsApi } from "../api/posts-api";

const postQueryKeys = {
    listPrefix: ["posts", "list"] as const,
    list: (query: PostListQuery) => [...postQueryKeys.listPrefix, query] as const,
    detail: (postId: number) => ["posts", "detail", postId] as const,
    comments: (postId: number) => ["posts", "comments", postId] as const
};

export function usePosts(query: PostListQuery) {
    return useQuery({
        queryKey: postQueryKeys.list(query),
        queryFn: ({ signal }) => postsApi.listPosts(query, { signal }),
        placeholderData: (previousData) => previousData
    });
}

export function usePost(postId: number) {
    return useQuery({
        queryKey: postQueryKeys.detail(postId),
        queryFn: ({ signal }) => postsApi.getPost(postId, { signal }),
        enabled: Number.isInteger(postId) && postId > 0
    });
}

export function useComments(postId: number) {
    return useQuery({
        queryKey: postQueryKeys.comments(postId),
        queryFn: ({ signal }) => postsApi.listComments(postId, { signal }),
        enabled: Number.isInteger(postId) && postId > 0
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postsApi.createPost,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: postQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

export function useUpdatePost(postId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdatePostInput) => postsApi.updatePost(postId, input),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: postQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: postQueryKeys.detail(postId) }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

export function useDeletePost(postId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => postsApi.deletePost(postId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: postQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
            queryClient.removeQueries({ queryKey: postQueryKeys.detail(postId) });
            queryClient.removeQueries({ queryKey: postQueryKeys.comments(postId) });
        }
    });
}

export function useCreateComment(postId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateCommentInput) => postsApi.createComment(postId, input),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: postQueryKeys.comments(postId) }),
                queryClient.invalidateQueries({ queryKey: postQueryKeys.detail(postId) }),
                queryClient.invalidateQueries({ queryKey: postQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

export function useUpdateComment(postId: number, commentId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateCommentInput) => postsApi.updateComment(commentId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: postQueryKeys.comments(postId) });
        }
    });
}

export function useDeleteComment(postId: number, commentId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => postsApi.deleteComment(commentId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: postQueryKeys.comments(postId) }),
                queryClient.invalidateQueries({ queryKey: postQueryKeys.detail(postId) }),
                queryClient.invalidateQueries({ queryKey: postQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}
