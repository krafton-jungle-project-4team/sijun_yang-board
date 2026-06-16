import { useSuspenseQuery } from "@tanstack/react-query";

import { usersApi } from "../api/users-api";

const userQueryKeys = {
    list: ["users"] as const
};

export function useSuspenseUsers() {
    return useSuspenseQuery({
        queryKey: userQueryKeys.list,
        queryFn: ({ signal }) => usersApi.listUsers({ signal })
    });
}
