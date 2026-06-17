import type { User } from "@nmm/shared";
import { queryOptions, useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { ApiClientError } from "@/shared/api/http-client";
import { authApi } from "./auth-api";

const authQueryKeys = {
    currentUser: ["auth", "current-user"] as const
};

export function useCurrentUserQuery() {
    return useQuery(currentUserQueryOptions());
}

export function useSuspenseCurrentUserQuery() {
    return useSuspenseQuery(currentUserQueryOptions());
}

export function currentUserQueryOptions() {
    return queryOptions({
        queryKey: authQueryKeys.currentUser,
        queryFn: ({ signal }) => fetchCurrentUser(signal)
    });
}

export function useLoginMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: async (user) => {
            queryClient.removeQueries();
            queryClient.setQueryData(authQueryKeys.currentUser, user);
            await queryClient.invalidateQueries();
        }
    });
}

export function useSignupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.signup,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
        }
    });
}

export function useUpdateMeMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.updateMe,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
        }
    });
}

export function useLogoutMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            queryClient.removeQueries();
            queryClient.setQueryData(authQueryKeys.currentUser, null);
        }
    });
}

async function fetchCurrentUser(signal?: AbortSignal): Promise<User | null> {
    try {
        return await authApi.getMe({ signal });
    } catch (error) {
        if (error instanceof ApiClientError && error.statusCode === 401) {
            return null;
        }

        throw error;
    }
}
