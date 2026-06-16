import type { ApprovalRequestListQuery } from "@nmm/shared";
import { createSerializer, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

const REQUEST_LIST_PAGE_SIZE = 10;

const requestListQueryParsers = {
    page: parseAsInteger,
    pageSize: parseAsInteger,
    projectId: parseAsInteger,
    search: parseAsString,
    sort: parseAsStringEnum<ApprovalRequestListQuery["sort"]>(["latest", "oldest"]),
    status: parseAsStringEnum<ApprovalRequestListQuery["status"]>(["ALL", "PENDING", "APPROVED", "REJECTED"])
};

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
const serializeRequestListQueryParams = createSerializer(requestListQueryParsers);

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

export function serializeRequestListQuery(query: ApprovalRequestListQuery) {
    return serializeRequestListQueryParams({
        page: query.page,
        pageSize: query.pageSize,
        projectId: query.projectId ?? null,
        search: query.search ?? null,
        sort: query.sort,
        status: query.status
    }).slice(1);
}

export function getRequestTotalPages(total: number) {
    return Math.max(1, Math.ceil(total / REQUEST_LIST_PAGE_SIZE));
}
