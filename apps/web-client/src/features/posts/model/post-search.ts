import type { PostListQuery } from "@nmm/shared";

export type PostDisplayView = "table" | "card";

export type PostSearchState = {
    page: number;
    search: string;
    sort: PostListQuery["sort"];
    tag: string;
    view: PostListQuery["view"];
    displayView: PostDisplayView;
};

export const POST_LIST_PAGE_SIZE = 10;

export const defaultPostSearch: PostSearchState = {
    page: 1,
    search: "",
    sort: "latest",
    tag: "",
    view: "all",
    displayView: "table"
};

export function toPostListQuery(search: PostSearchState): PostListQuery {
    return {
        page: search.page,
        pageSize: POST_LIST_PAGE_SIZE,
        sort: search.sort,
        view: search.view,
        search: search.search || undefined,
        tag: search.tag || undefined
    };
}

export function getTotalPages(total: number) {
    return Math.max(1, Math.ceil(total / POST_LIST_PAGE_SIZE));
}
