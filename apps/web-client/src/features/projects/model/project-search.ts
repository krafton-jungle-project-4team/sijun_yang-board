import type { ProjectListQuery } from "@nmm/shared";
import { createSerializer, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

const PROJECT_LIST_PAGE_SIZE = 10;

const projectListQueryParsers = {
    page: parseAsInteger,
    pageSize: parseAsInteger,
    search: parseAsString,
    sort: parseAsStringEnum<ProjectListQuery["sort"]>(["latest", "oldest", "name"]),
    status: parseAsStringEnum<ProjectListQuery["status"]>(["ALL", "PLANNED", "ACTIVE", "COMPLETED", "ARCHIVED"])
};

const projectSearchParsers = {
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    sort: parseAsStringEnum<ProjectListQuery["sort"]>(["latest", "oldest", "name"]).withDefault("latest"),
    status: parseAsStringEnum<ProjectListQuery["status"]>([
        "ALL",
        "PLANNED",
        "ACTIVE",
        "COMPLETED",
        "ARCHIVED"
    ]).withDefault("ALL")
};
const serializeProjectListQueryParams = createSerializer(projectListQueryParsers);

export type ProjectSearchState = {
    page: number;
    search: string;
    sort: ProjectListQuery["sort"];
    status: ProjectListQuery["status"];
};

export function useProjectSearchParams() {
    return useQueryStates(projectSearchParsers);
}

export function toProjectListQuery(search: ProjectSearchState): ProjectListQuery {
    return {
        page: Math.max(1, search.page),
        pageSize: PROJECT_LIST_PAGE_SIZE,
        search: search.search || undefined,
        sort: search.sort,
        status: search.status
    };
}

export function serializeProjectListQuery(query: ProjectListQuery) {
    return serializeProjectListQueryParams({
        page: query.page,
        pageSize: query.pageSize,
        search: query.search ?? null,
        sort: query.sort,
        status: query.status
    }).slice(1);
}

export function getProjectTotalPages(total: number) {
    return Math.max(1, Math.ceil(total / PROJECT_LIST_PAGE_SIZE));
}
