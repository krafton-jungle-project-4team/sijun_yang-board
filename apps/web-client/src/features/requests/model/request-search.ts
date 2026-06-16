import type { ApprovalRequestListQuery } from "@nmm/shared";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

const REQUEST_LIST_PAGE_SIZE = 10;

const requestSearchParsers = {
    page: parseAsInteger.withDefault(1),
    projectId: parseAsInteger,
    search: parseAsString.withDefault(""),
    sort: parseAsStringEnum<ApprovalRequestListQuery["sort"]>(["latest", "oldest"]).withDefault("latest"),
    status: parseAsStringEnum<ApprovalRequestListQuery["status"]>([
        "ALL",
        "PENDING",
        "APPROVED",
        "REJECTED"
    ]).withDefault("ALL")
};

export type RequestSearchState = {
    page: number;
    projectId: number | null;
    search: string;
    sort: ApprovalRequestListQuery["sort"];
    status: ApprovalRequestListQuery["status"];
};

export function useRequestSearchParams() {
    return useQueryStates(requestSearchParsers);
}

export function toRequestListQuery(search: RequestSearchState): ApprovalRequestListQuery {
    return {
        page: Math.max(1, search.page),
        pageSize: REQUEST_LIST_PAGE_SIZE,
        projectId: search.projectId ?? undefined,
        search: search.search || undefined,
        sort: search.sort,
        status: search.status
    };
}

export function getRequestTotalPages(total: number) {
    return Math.max(1, Math.ceil(total / REQUEST_LIST_PAGE_SIZE));
}
