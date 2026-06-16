import { useQuery } from "@tanstack/react-query";

import { usersApi } from "../api/users-api";

const userQueryKeys = {
    list: ["users"] as const
};

export function useUsers() {
    return useQuery({
        queryKey: userQueryKeys.list,
        queryFn: ({ signal }) => usersApi.listUsers({ signal })
    });
}
