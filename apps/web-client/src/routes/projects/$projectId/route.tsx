import { Card, CardDescription, CardHeader, Tabs, TabsList, TabsTrigger } from "@nmm/ui/components";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ListTodoIcon, PencilIcon, SquareKanbanIcon } from "lucide-react";

import { useCurrentUserQuery } from "@/features/auth/api/auth-queries";
import { canManageProjects } from "@/features/projects/model/project-permissions";

export const Route = createFileRoute("/projects/$projectId")({
    component: ProjectRouteLayout
});

function ProjectRouteLayout() {
    const { projectId } = Route.useParams();
    const numericProjectId = Number(projectId);
    const pathname = useRouterState({
        select: (state) => state.location.pathname
    });
    const currentUser = useCurrentUserQuery().data;
    const canEditProject = canManageProjects(currentUser);

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid project.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <>
            <Tabs className="md:hidden" value={getProjectRouteTabValue(pathname)}>
                <TabsList>
                    <TabsTrigger asChild value="overview">
                        <Link to="/projects/$projectId" params={{ projectId }}>
                            <SquareKanbanIcon />
                            Overview
                        </Link>
                    </TabsTrigger>
                    {pathname.includes("/tasks/") ? (
                        <TabsTrigger type="button" value="task">
                            <ListTodoIcon />
                            Task
                        </TabsTrigger>
                    ) : null}
                    {canEditProject ? (
                        <TabsTrigger asChild value="edit">
                            <Link to="/projects/$projectId/edit" params={{ projectId }}>
                                <PencilIcon />
                                Edit
                            </Link>
                        </TabsTrigger>
                    ) : null}
                </TabsList>
            </Tabs>
            <Outlet />
        </>
    );
}

function getProjectRouteTabValue(pathname: string) {
    if (pathname.endsWith("/edit")) {
        return "edit";
    }

    if (pathname.includes("/tasks/")) {
        return "task";
    }

    return "overview";
}
