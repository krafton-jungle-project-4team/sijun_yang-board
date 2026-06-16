import type { PostListQuery } from "@nmm/shared";
import { createSerializer, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

export type PostDisplayView = "table" | "card";

const POST_LIST_PAGE_SIZE = 10;

const postListQueryParsers = {
    page: parseAsInteger,
    pageSize: parseAsInteger,
    search: parseAsString,
    sort: parseAsStringEnum<PostListQuery["sort"]>(["latest", "popular"]),
    view: parseAsStringEnum<PostListQuery["view"]>(["all", "mine"])
};

const postSearchParsers = {
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    sort: parseAsStringEnum<PostListQuery["sort"]>(["latest", "popular"]).withDefault("latest"),
    view: parseAsStringEnum<PostListQuery["view"]>(["all", "mine"]).withDefault("all"),
    displayView: parseAsStringEnum<PostDisplayView>(["table", "card"]).withDefault("table")
};
const serializePostListQueryParams = createSerializer(postListQueryParsers);

export type PostSearchState = {
    page: number;
    search: string;
    sort: PostListQuery["sort"];
    view: PostListQuery["view"];
    displayView: PostDisplayView;
};

export function usePostSearchParams() {
    return useQueryStates(postSearchParsers);
}

export function toPostListQuery(search: PostSearchState): PostListQuery {
    return {
        page: Math.max(1, search.page),
        pageSize: POST_LIST_PAGE_SIZE,
        sort: search.sort,
        view: search.view,
        search: search.search || undefined
    };
}

export function serializePostListQuery(query: PostListQuery) {
    return serializePostListQueryParams({
        page: query.page,
        pageSize: query.pageSize,
        search: query.search ?? null,
        sort: query.sort,
        view: query.view
    }).slice(1);
}

export function getTotalPages(total: number) {
    return Math.max(1, Math.ceil(total / POST_LIST_PAGE_SIZE));
}
