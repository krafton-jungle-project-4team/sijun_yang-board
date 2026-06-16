import type { ApprovalRequestListQuery } from "@nmm/shared";
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
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useProjects } from "../../features/projects/hooks/use-projects";
import { toProjectListQuery } from "../../features/projects/model/project-search";
import { useRequests } from "../../features/requests/hooks/use-requests";
import { approvalRequestStatusLabels } from "../../features/requests/model/request-labels";
import {
    getRequestTotalPages,
    toRequestListQuery,
    useRequestSearchParams
} from "../../features/requests/model/request-search";

const requestSortOptions: Array<{ label: string; value: ApprovalRequestListQuery["sort"] }> = [
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" }
];
const requestStatusOptions: Array<{ label: string; value: ApprovalRequestListQuery["status"] }> = [
    { label: "All statuses", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" }
];

export function RequestsPage() {
    const [search, setSearch] = useRequestSearchParams();
    const [searchDraft, setSearchDraft] = useState(search.search);
    const query = useMemo(() => toRequestListQuery(search), [search]);
    const requestsQuery = useRequests(query);
    const projectFilterQuery = useProjects(
        toProjectListQuery({
            page: 1,
            search: "",
            sort: "name",
            status: "ALL"
        })
    );
    const requestsData = requestsQuery.data;
    const currentPage = requestsData?.page ?? search.page;
    const totalPages = getRequestTotalPages(requestsData?.total ?? 0);
    const selectedProjectValue = search.projectId ? String(search.projectId) : "ALL";

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

    function handleSortChange(sort: ApprovalRequestListQuery["sort"]) {
        void setSearch({
            page: 1,
            sort
        });
    }

    function handleStatusChange(status: ApprovalRequestListQuery["status"]) {
        void setSearch({
            page: 1,
            status
        });
    }

    function handleProjectChange(value: string) {
        void setSearch({
            page: 1,
            projectId: value === "ALL" ? null : Number(value)
        });
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

    return (
        <section className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <CardHeader className="min-w-0 flex-1 px-0">
                    <CardTitle>Requests</CardTitle>
                    <CardDescription>Project-linked approvals and review state.</CardDescription>
                </CardHeader>
                <Button asChild>
                    <Link to="/requests/new">
                        <Plus />
                        New request
                    </Link>
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_160px_180px]">
                <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSearchSubmit}>
                    <InputGroup>
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            name="search"
                            placeholder="Search requests"
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
                        {requestSortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={search.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {requestStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedProjectValue} onValueChange={handleProjectChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All projects</SelectItem>
                        {(projectFilterQuery.data?.items ?? []).map((project) => (
                            <SelectItem key={project.id} value={String(project.id)}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {requestsQuery.isError ? (
                <Card>
                    <CardHeader>
                        <CardDescription>Could not load requests.</CardDescription>
                    </CardHeader>
                </Card>
            ) : null}
            {requestsQuery.isPending ? (
                <Card>
                    <CardHeader>
                        <CardDescription>Loading requests...</CardDescription>
                    </CardHeader>
                </Card>
            ) : null}
            {requestsData ? (
                <>
                    <Card className="gap-0 py-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request</TableHead>
                                    <TableHead className="hidden md:table-cell">Project</TableHead>
                                    <TableHead className="hidden lg:table-cell">Requester</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requestsData.items.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            <div className="grid gap-1">
                                                <Link
                                                    to="/requests/$requestId"
                                                    params={{ requestId: String(request.id) }}
                                                >
                                                    {request.title}
                                                </Link>
                                                <CardDescription className="line-clamp-1">
                                                    {request.description}
                                                </CardDescription>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{request.projectName}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{request.requesterName}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {approvalRequestStatusLabels[request.status]}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                    <div className="flex items-center justify-between gap-3">
                        <Badge variant="secondary">
                            {currentPage} / {totalPages} · {requestsData.total} requests
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
