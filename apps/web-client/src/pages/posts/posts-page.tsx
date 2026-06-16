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
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { usePosts } from "../../features/posts/hooks/use-posts";
import {
    getTotalPages,
    toPostListQuery,
    type PostDisplayView,
    usePostSearchParams
} from "../../features/posts/model/post-search";
import { PostCards } from "../../features/posts/ui/post-cards";
import { PostTable } from "../../features/posts/ui/post-table";

const sortOptions: Array<{ label: string; value: PostListQuery["sort"] }> = [
    { label: "Latest", value: "latest" },
    { label: "Popular", value: "popular" }
];
const ownerViewOptions: Array<{ label: string; value: PostListQuery["view"] }> = [
    { label: "All announcements", value: "all" },
    { label: "My announcements", value: "mine" }
];

export function PostsPage() {
    const [search, setSearch] = usePostSearchParams();
    const [searchDraft, setSearchDraft] = useState(search.search);
    const query = useMemo(() => toPostListQuery(search), [search]);
    const currentUser = useCurrentUserQuery().data;
    const postsQuery = usePosts(query);
    const postsData = postsQuery.data;
    const currentPage = postsData?.page ?? search.page;
    const totalPages = getTotalPages(postsData?.total ?? 0);

    useEffect(() => {
        setSearchDraft(search.search);
    }, [search.search]);

    function handleSearchInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchDraft(event.target.value);
    }

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void setSearch({
            page: 1,
            search: searchDraft.trim()
        });
    }

    function handleSortChange(sort: PostListQuery["sort"]) {
        void setSearch({
            page: 1,
            sort
        });
    }

    function handleOwnerViewChange(view: PostListQuery["view"]) {
        void setSearch({
            page: 1,
            view
        });
    }

    function handleTableViewClick() {
        setDisplayView("table");
    }

    function handleCardViewClick() {
        setDisplayView("card");
    }

    function handlePreviousPageClick() {
        void setSearch((current) => ({
            page: Math.max(1, current.page - 1)
        }));
    }

    function handleNextPageClick() {
        void setSearch((current) => ({
            page: Math.min(totalPages, current.page + 1)
        }));
    }

    function setDisplayView(displayView: PostDisplayView) {
        void setSearch({
            displayView
        });
    }

    return (
        <section className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <CardHeader className="min-w-0 flex-1 px-0">
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>Updates, notes, comments, views.</CardDescription>
                </CardHeader>
                <Button asChild>
                    <Link to="/posts/new">
                        <Plus />
                        New announcement
                    </Link>
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_170px_auto]">
                <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSearchSubmit}>
                    <InputGroup>
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            name="search"
                            placeholder="Search announcements"
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
                        <CardDescription>Could not load announcements.</CardDescription>
                    </CardHeader>
                </Card>
            ) : null}
            {postsQuery.isPending ? (
                <Card>
                    <CardHeader>
                        <CardDescription>Loading announcements...</CardDescription>
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
                            {currentPage} / {totalPages} · {postsData.total} announcements
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
