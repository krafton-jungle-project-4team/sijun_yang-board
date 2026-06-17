import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/features/dashboard/api/dashboard-api";

export const dashboardQueryKeys = {
    detail: ["dashboard"] as const
};

export function useSuspenseDashboard() {
    return useSuspenseQuery({
        queryKey: dashboardQueryKeys.detail,
        queryFn: ({ signal }) => dashboardApi.getDashboard({ signal })
    });
}
