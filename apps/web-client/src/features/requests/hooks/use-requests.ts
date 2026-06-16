import type { ApprovalRequestListQuery, ReviewApprovalRequestInput } from "@nmm/shared";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { dashboardQueryKeys } from "../../dashboard/hooks/use-dashboard";
import { projectQueryKeys } from "../../projects/hooks/use-projects";
import { requestsApi } from "../api/requests-api";

const requestQueryKeys = {
    listPrefix: ["requests", "list"] as const,
    list: (query: ApprovalRequestListQuery) => [...requestQueryKeys.listPrefix, query] as const,
    detail: (requestId: number) => ["requests", "detail", requestId] as const
};

export function useSuspenseRequests(query: ApprovalRequestListQuery) {
    return useSuspenseQuery({
        queryKey: requestQueryKeys.list(query),
        queryFn: ({ signal }) => requestsApi.listRequests(query, { signal })
    });
}

export function useSuspenseRequest(requestId: number) {
    return useSuspenseQuery({
        queryKey: requestQueryKeys.detail(requestId),
        queryFn: ({ signal }) => requestsApi.getRequest(requestId, { signal })
    });
}

export function useCreateRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: requestsApi.createRequest,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: requestQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

export function useApproveRequest(requestId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ReviewApprovalRequestInput) => requestsApi.approveRequest(requestId, input),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: requestQueryKeys.detail(requestId) }),
                queryClient.invalidateQueries({ queryKey: requestQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

export function useRejectRequest(requestId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ReviewApprovalRequestInput) => requestsApi.rejectRequest(requestId, input),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: requestQueryKeys.detail(requestId) }),
                queryClient.invalidateQueries({ queryKey: requestQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}
