import type { PostListQuery } from "@nmm/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { postsApi } from "../api/posts-api";

export function usePosts(query: PostListQuery) {
    return useQuery({
        queryKey: ["posts", query],
        queryFn: () => postsApi.listPosts(query)
    });
}

export function usePost(postId: number) {
    return useQuery({
        queryKey: ["posts", postId],
        queryFn: () => postsApi.getPost(postId)
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postsApi.createPost,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });
}

export function useUpdatePost(postId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postsApi.updatePost.bind(postsApi, postId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            await queryClient.invalidateQueries({ queryKey: ["posts", postId] });
        }
    });
}
