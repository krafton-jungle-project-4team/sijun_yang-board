import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

import { currentUserQueryOptions } from "@/features/auth/api/auth-queries";

export async function requireAuthenticatedUser(queryClient: QueryClient) {
    const currentUser = await queryClient.fetchQuery({
        ...currentUserQueryOptions(),
        staleTime: 0
    });

    if (!currentUser) {
        throw redirect({ to: "/login" });
    }

    return currentUser;
}
