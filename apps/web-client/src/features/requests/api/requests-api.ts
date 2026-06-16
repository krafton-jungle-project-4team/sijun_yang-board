import {
    approvalRequestDetailSchema,
    approvalRequestListResultSchema,
    idCommandResultSchema,
    type ApprovalRequestListQuery,
    type CreateApprovalRequestInput,
    type ReviewApprovalRequestInput
} from "@nmm/shared";
import type { Options } from "ky";

import { getJson, postJson } from "../../../shared/api/http-client";
import { serializeRequestListQuery } from "../model/request-search";

export const requestsApi = {
    listRequests(query: ApprovalRequestListQuery, options?: Options) {
        return getJson("requests", approvalRequestListResultSchema, {
            ...options,
            searchParams: serializeRequestListQuery(query)
        });
    },
    getRequest(requestId: number, options?: Options) {
        return getJson(`requests/${requestId}`, approvalRequestDetailSchema, options);
    },
    createRequest(input: CreateApprovalRequestInput) {
        return postJson("requests", idCommandResultSchema, input);
    },
    approveRequest(requestId: number, input: ReviewApprovalRequestInput) {
        return postJson(`requests/${requestId}/approve`, idCommandResultSchema, input);
    },
    rejectRequest(requestId: number, input: ReviewApprovalRequestInput) {
        return postJson(`requests/${requestId}/reject`, idCommandResultSchema, input);
    }
};
