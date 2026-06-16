import type { PostListQuery } from "@nmm/shared";
import {
    Badge,
    Button,
    Card,
    CardContent,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { useCurrentUserQuery } from "../../features/auth";
import {
    defaultPostSearch,
    getTotalPages,
    PostCards,
    PostTable,
    toPostListQuery,
    usePosts,
    usePostTags,
    type PostDisplayView,
    type PostSearchState
} from "../../features/posts";

const ALL_TAGS_VALUE = "all";
const sortOptions: Array<{ label: string; value: PostListQuery["sort"] }> = [
    { label: "Latest", value: "latest" },
    { label: "Popular", value: "popular" }
];
const ownerViewOptions: Array<{ label: string; value: PostListQuery["view"] }> = [
    { label: "All posts", value: "all" },
    { label: "My posts", value: "mine" }
];

export function PostsPage() {
    const [search, setSearch] = useState<PostSearchState>(defaultPostSearch);
    const [searchDraft, setSearchDraft] = useState(defaultPostSearch.search);
    const query = useMemo(() => toPostListQuery(search), [search]);
    const currentUser = useCurrentUserQuery().data;
    const tagsQuery = usePostTags();
    const postsQuery = usePosts(query);
    const tags = tagsQuery.data ?? [];
    const postsData = postsQuery.data;
    const currentPage = postsData?.page ?? search.page;
    const totalPages = getTotalPages(postsData?.total ?? 0);
    const selectedTagValue = search.tag || ALL_TAGS_VALUE;

    function handleSearchInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchDraft(event.target.value);
    }

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearch((current) => ({
            ...current,
            page: 1,
            search: searchDraft.trim()
        }));
    }

    function handleSortChange(sort: PostListQuery["sort"]) {
        setSearch((current) => ({
            ...current,
            page: 1,
            sort
        }));
    }

    function handleOwnerViewChange(view: PostListQuery["view"]) {
        setSearch((current) => ({
            ...current,
            page: 1,
            view
        }));
    }

    function handleTagChange(tag: string) {
        setSearch((current) => ({
            ...current,
            page: 1,
            tag: tag === ALL_TAGS_VALUE ? "" : tag
        }));
    }

    function handleTableViewClick() {
        setDisplayView("table");
    }

    function handleCardViewClick() {
        setDisplayView("card");
    }

    function handlePreviousPageClick() {
        setSearch((current) => ({
            ...current,
            page: Math.max(1, current.page - 1)
        }));
    }

    function handleNextPageClick() {
        setSearch((current) => ({
            ...current,
            page: Math.min(totalPages, current.page + 1)
        }));
    }

    function setDisplayView(displayView: PostDisplayView) {
        setSearch((current) => ({
            ...current,
            displayView
        }));
    }

    return (
        <section className="page-stack">
            <div className="page-heading">
                <div className="grid gap-1">
                    <h1>Posts</h1>
                    <p className="muted">Search, tag filters, comments, and guarded mutations.</p>
                </div>
                <Button asChild>
                    <Link to="/posts/new">
                        <Plus />
                        New post
                    </Link>
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_150px_150px_auto]">
                <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSearchSubmit}>
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            name="search"
                            className="pl-9"
                            placeholder="Search posts"
                            value={searchDraft}
                            onChange={handleSearchInputChange}
                        />
                    </div>
                    <Button type="submit" variant="outline">
                        <Search />
                        Search
                    </Button>
                </form>
                <Select value={search.sort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={search.view} onValueChange={handleOwnerViewChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ownerViewOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedTagValue} onValueChange={handleTagChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_TAGS_VALUE}>All tags</SelectItem>
                        {tags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.name}>
                                {tag.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        size="icon"
                        variant={search.displayView === "table" ? "secondary" : "ghost"}
                        aria-label="Table view"
                        onClick={handleTableViewClick}
                    >
                        <List />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant={search.displayView === "card" ? "secondary" : "ghost"}
                        aria-label="Card view"
                        onClick={handleCardViewClick}
                    >
                        <LayoutGrid />
                    </Button>
                </div>
            </div>

            {postsQuery.isError ? <p className="muted">Could not load posts.</p> : null}
            {postsQuery.isPending ? (
                <Card>
                    <CardContent className="text-sm text-muted-foreground">Loading posts...</CardContent>
                </Card>
            ) : null}
            {postsData ? (
                <>
                    {search.displayView === "table" ? (
                        <PostTable currentUser={currentUser} posts={postsData.items} />
                    ) : (
                        <PostCards currentUser={currentUser} posts={postsData.items} />
                    )}
                    <div className="flex items-center justify-between gap-3">
                        <Badge variant="secondary">
                            {currentPage} / {totalPages} · {postsData.total} posts
                        </Badge>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={currentPage <= 1}
                                onClick={handlePreviousPageClick}
                            >
                                Previous
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={currentPage >= totalPages}
                                onClick={handleNextPageClick}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
}
