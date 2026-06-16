import type { ApprovalRequestListQuery, ReviewApprovalRequestInput } from "@nmm/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "../../dashboard/hooks/use-dashboard";
import { projectQueryKeys } from "../../projects/hooks/use-projects";
import { requestsApi } from "../api/requests-api";

const requestQueryKeys = {
    listPrefix: ["requests", "list"] as const,
    list: (query: ApprovalRequestListQuery) => [...requestQueryKeys.listPrefix, query] as const,
    detail: (requestId: number) => ["requests", "detail", requestId] as const
};

export function useRequests(query: ApprovalRequestListQuery) {
    return useQuery({
        queryKey: requestQueryKeys.list(query),
        queryFn: ({ signal }) => requestsApi.listRequests(query, { signal }),
        placeholderData: (previousData) => previousData
    });
}

export function useRequest(requestId: number) {
    return useQuery({
        queryKey: requestQueryKeys.detail(requestId),
        queryFn: ({ signal }) => requestsApi.getRequest(requestId, { signal }),
        enabled: Number.isInteger(requestId) && requestId > 0
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
