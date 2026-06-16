import type { User } from "@nmm/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiClientError } from "../../../shared/api/http-client";
import { authApi } from "./auth-api";

const authQueryKeys = {
    currentUser: ["auth", "current-user"] as const
};

export function useCurrentUserQuery() {
    return useQuery({
        queryKey: authQueryKeys.currentUser,
        queryFn: ({ signal }) => fetchCurrentUser(signal)
    });
}

export function useCompleteSignupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.completeSignup,
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
            queryClient.setQueryData(authQueryKeys.currentUser, null);
        }
    });
}

async function fetchCurrentUser(signal?: AbortSignal): Promise<User | null> {
    try {
        return await authApi.getMe({ signal });
    } catch (error) {
        if (error instanceof ApiClientError && error.code === "UNAUTHENTICATED") {
            return null;
        }

        throw error;
    }
}
