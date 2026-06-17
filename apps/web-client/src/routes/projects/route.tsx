import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireAuthenticatedUser } from "@/app/route-auth";
import { ProjectWorkspaceShell } from "./-project-workspace-shell";

export const Route = createFileRoute("/projects")({
    beforeLoad: ({ context }) => requireAuthenticatedUser(context.queryClient),
    component: ProjectsRouteLayout
});

function ProjectsRouteLayout() {
    return (
        <ProjectWorkspaceShell>
            <Outlet />
        </ProjectWorkspaceShell>
    );
}
