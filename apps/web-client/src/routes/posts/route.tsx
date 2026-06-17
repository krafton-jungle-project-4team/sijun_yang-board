import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireAuthenticatedUser } from "@/app/route-auth";
import { PostWorkspaceShell } from "./-post-workspace-shell";

export const Route = createFileRoute("/posts")({
    beforeLoad: ({ context }) => requireAuthenticatedUser(context.queryClient),
    component: PostsRouteLayout
});

function PostsRouteLayout() {
    return (
        <PostWorkspaceShell>
            <Outlet />
        </PostWorkspaceShell>
    );
}
