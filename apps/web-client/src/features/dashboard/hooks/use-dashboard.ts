import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "../api/dashboard-api";

export const dashboardQueryKeys = {
    detail: ["dashboard"] as const
};

export function useDashboard(enabled = true) {
    return useQuery({
        queryKey: dashboardQueryKeys.detail,
        queryFn: ({ signal }) => dashboardApi.getDashboard({ signal }),
        enabled
    });
}
