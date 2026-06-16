import type { ProjectListQuery } from "@nmm/shared";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

const PROJECT_LIST_PAGE_SIZE = 10;

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

export function getProjectTotalPages(total: number) {
    return Math.max(1, Math.ceil(total / PROJECT_LIST_PAGE_SIZE));
}
