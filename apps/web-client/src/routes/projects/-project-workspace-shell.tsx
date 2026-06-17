import {
    Button,
    ButtonGroup,
    CardDescription,
    CardHeader,
    CardTitle,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator
} from "@nmm/ui/components";
import { Link, useRouterState } from "@tanstack/react-router";
import {
    ArchiveIcon,
    CalendarClockIcon,
    CheckCircle2Icon,
    FolderKanbanIcon,
    ListChecksIcon,
    ListTodoIcon,
    PencilIcon,
    PlusIcon,
    RocketIcon,
    SquareKanbanIcon
} from "lucide-react";
import type { ReactNode } from "react";

import { useCurrentUserQuery } from "@/features/auth/api/auth-queries";
import { canManageProjects } from "@/features/projects/model/project-permissions";

type ProjectWorkspaceShellProps = {
    children: ReactNode;
};

export function ProjectWorkspaceShell({ children }: ProjectWorkspaceShellProps) {
    const { pathname, search } = useRouterState({
        select: (state) => ({
            pathname: state.location.pathname,
            search: state.location.search as Record<string, unknown>
        })
    });
    const currentUser = useCurrentUserQuery().data;
    const canCreateProject = canManageProjects(currentUser);
    const currentProjectId = getCurrentProjectId(pathname);
    const currentProjectStatus = getProjectStatusSearchValue(search.status);
    const isIndexRoute = pathname === "/projects";
    const isNewRoute = pathname === "/projects/new";
    const currentProjectOverviewPath = currentProjectId ? `/projects/${currentProjectId}` : null;
    const currentProjectEditPath = currentProjectOverviewPath ? `${currentProjectOverviewPath}/edit` : null;
    const isTaskRoute = currentProjectOverviewPath
        ? pathname.startsWith(`${currentProjectOverviewPath}/tasks/`)
        : false;

    return (
        <SidebarProvider className="!min-h-0 overflow-hidden rounded-md border md:h-[calc(100svh-12rem)] md:!min-h-[32rem]">
            <Sidebar collapsible="none" className="hidden self-stretch border-r md:flex">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild size="lg" isActive={pathname.startsWith("/projects")}>
                                <Link to="/projects">
                                    <FolderKanbanIcon />
                                    <span>Projects</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentProjectStatus === "ALL"}
                                    >
                                        <Link
                                            to="/projects"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "ALL"
                                            }}
                                        >
                                            <ListChecksIcon />
                                            <span>All projects</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentProjectStatus === "PLANNED"}
                                    >
                                        <Link
                                            to="/projects"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "PLANNED"
                                            }}
                                        >
                                            <CalendarClockIcon />
                                            <span>Planned</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentProjectStatus === "ACTIVE"}
                                    >
                                        <Link
                                            to="/projects"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "ACTIVE"
                                            }}
                                        >
                                            <RocketIcon />
                                            <span>Active</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentProjectStatus === "COMPLETED"}
                                    >
                                        <Link
                                            to="/projects"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "COMPLETED"
                                            }}
                                        >
                                            <CheckCircle2Icon />
                                            <span>Completed</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentProjectStatus === "ARCHIVED"}
                                    >
                                        <Link
                                            to="/projects"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "ARCHIVED"
                                            }}
                                        >
                                            <ArchiveIcon />
                                            <span>Archived</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {canCreateProject ? (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isNewRoute}>
                                            <Link to="/projects/new">
                                                <PlusIcon />
                                                <span>New project</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ) : null}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {currentProjectId && currentProjectOverviewPath && currentProjectEditPath ? (
                        <>
                            <SidebarSeparator />
                            <SidebarGroup>
                                <SidebarGroupLabel>Current project</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === currentProjectOverviewPath}
                                            >
                                                <Link
                                                    to="/projects/$projectId"
                                                    params={{ projectId: currentProjectId }}
                                                >
                                                    <SquareKanbanIcon />
                                                    <span>Overview</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        {isTaskRoute ? (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton type="button" isActive>
                                                    <ListTodoIcon />
                                                    <span>Task detail</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ) : null}
                                        {canCreateProject ? (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={pathname === currentProjectEditPath}
                                                >
                                                    <Link
                                                        to="/projects/$projectId/edit"
                                                        params={{ projectId: currentProjectId }}
                                                    >
                                                        <PencilIcon />
                                                        <span>Edit</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ) : null}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </>
                    ) : null}
                </SidebarContent>
                <SidebarFooter>
                    <span className="px-2 text-xs text-sidebar-foreground/70">Project workspace</span>
                </SidebarFooter>
            </Sidebar>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
                <div className="grid gap-4 md:hidden">
                    <CardHeader className="px-0">
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>Track initiatives, tasks, and approvals.</CardDescription>
                    </CardHeader>
                    <ButtonGroup>
                        <Button asChild variant={isIndexRoute ? "secondary" : "outline"}>
                            <Link to="/projects">
                                <ListChecksIcon data-icon="inline-start" />
                                All projects
                            </Link>
                        </Button>
                        {canCreateProject ? (
                            <Button asChild variant={isNewRoute ? "secondary" : "outline"}>
                                <Link to="/projects/new">
                                    <PlusIcon data-icon="inline-start" />
                                    New project
                                </Link>
                            </Button>
                        ) : null}
                    </ButtonGroup>
                </div>
                {children}
            </div>
        </SidebarProvider>
    );
}

function getCurrentProjectId(pathname: string) {
    const [, workspace, projectId] = pathname.split("/");

    if (workspace !== "projects" || !projectId || projectId === "new") {
        return null;
    }

    const numericProjectId = Number(projectId);

    return Number.isInteger(numericProjectId) && numericProjectId > 0 ? projectId : null;
}

function getProjectStatusSearchValue(value: unknown) {
    switch (value) {
        case "PLANNED":
        case "ACTIVE":
        case "COMPLETED":
        case "ARCHIVED":
            return value;
        default:
            return "ALL";
    }
}
