import type { ProjectListQuery } from "@nmm/shared";
import {
    Badge,
    Button,
    ButtonGroup,
    Card,
    CardDescription,
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
import { Search } from "lucide-react";
import { Suspense, type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";

import { SectionSkeleton } from "../../app/section-skeleton";
import { useSuspenseProjects } from "../../features/projects/hooks/use-projects";
import { projectStatusLabels } from "../../features/projects/model/project-labels";
import {
    getProjectTotalPages,
    toProjectListQuery,
    useProjectSearchParams
} from "../../features/projects/model/project-search";

type SetProjectSearch = ReturnType<typeof useProjectSearchParams>[1];

const projectSortOptions: Array<{ label: string; value: ProjectListQuery["sort"] }> = [
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" },
    { label: "Name", value: "name" }
];
const projectStatusOptions: Array<{ label: string; value: ProjectListQuery["status"] }> = [
    { label: "All statuses", value: "ALL" },
    { label: "Planned", value: "PLANNED" },
    { label: "Active", value: "ACTIVE" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Archived", value: "ARCHIVED" }
];

export function ProjectsPage() {
    const [search, setSearch] = useProjectSearchParams();
    const [searchDraft, setSearchDraft] = useState(search.search);
    const query = useMemo(() => toProjectListQuery(search), [search]);

    useEffect(() => {
        setSearchDraft(search.search);
    }, [search.search]);

    function handleSearchInputChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchDraft(event.target.value);
    }

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void setSearch({
            page: 1,
            search: searchDraft.trim()
        });
    }

    function handleSortChange(sort: ProjectListQuery["sort"]) {
        void setSearch({
            page: 1,
            sort
        });
    }

    function handleStatusChange(status: ProjectListQuery["status"]) {
        void setSearch({
            page: 1,
            status
        });
    }

    return (
        <section className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_170px]">
                <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSearchSubmit}>
                    <InputGroup>
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            name="search"
                            placeholder="Search projects"
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
                        {projectSortOptions.map((option) => (
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
                        {projectStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Suspense fallback={<SectionSkeleton title="Projects" description="Loading projects..." rows={4} />}>
                <ProjectsResult query={query} setSearch={setSearch} />
            </Suspense>
        </section>
    );
}

function ProjectsResult({ query, setSearch }: ProjectsResultProps) {
    const projectsData = useSuspenseProjects(query).data;
    const currentPage = projectsData.page;
    const totalPages = getProjectTotalPages(projectsData.total);

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
        <>
            <Card className="gap-0 py-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead className="hidden md:table-cell">Owner</TableHead>
                            <TableHead className="hidden lg:table-cell">Work</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectsData.items.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>
                                    <div className="grid gap-1">
                                        <Link to="/projects/$projectId" params={{ projectId: String(project.id) }}>
                                            {project.name}
                                        </Link>
                                        <CardDescription className="line-clamp-1">
                                            {project.description}
                                        </CardDescription>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{project.ownerName}</TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {project.openTaskCount} open tasks · {project.pendingRequestCount} pending
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{projectStatusLabels[project.status]}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
            <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary">
                    {currentPage} / {totalPages} · {projectsData.total} projects
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
    );
}

type ProjectsResultProps = {
    query: ProjectListQuery;
    setSearch: SetProjectSearch;
};
