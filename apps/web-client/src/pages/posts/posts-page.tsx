import type { PostListQuery } from "@nmm/shared";
import {
    Badge,
    Button,
    ButtonGroup,
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
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
        <section className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <CardHeader className="px-0">
                    <CardTitle>Posts</CardTitle>
                    <CardDescription>Search, tag filters, comments, and guarded mutations.</CardDescription>
                </CardHeader>
                <Button asChild>
                    <Link to="/posts/new">
                        <Plus />
                        New post
                    </Link>
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_150px_150px_auto]">
                <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSearchSubmit}>
                    <InputGroup>
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            name="search"
                            placeholder="Search posts"
                            value={searchDraft}
                            onChange={handleSearchInputChange}
                        />
                    </InputGroup>
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
                <ButtonGroup>
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
                </ButtonGroup>
            </div>

            {postsQuery.isError ? (
                <Card>
                    <CardHeader>
                        <CardDescription>Could not load posts.</CardDescription>
                    </CardHeader>
                </Card>
            ) : null}
            {postsQuery.isPending ? (
                <Card>
                    <CardHeader>
                        <CardDescription>Loading posts...</CardDescription>
                    </CardHeader>
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
                        <ButtonGroup>
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
                        </ButtonGroup>
                    </div>
                </>
            ) : null}
        </section>
    );
}
