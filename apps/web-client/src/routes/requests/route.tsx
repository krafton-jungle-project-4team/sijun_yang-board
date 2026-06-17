import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireAuthenticatedUser } from "@/app/route-auth";
import { RequestWorkspaceShell } from "./-request-workspace-shell";

export const Route = createFileRoute("/requests")({
    beforeLoad: ({ context }) => requireAuthenticatedUser(context.queryClient),
    component: RequestsRouteLayout
});

function RequestsRouteLayout() {
    return (
        <RequestWorkspaceShell>
            <Outlet />
        </RequestWorkspaceShell>
    );
}
