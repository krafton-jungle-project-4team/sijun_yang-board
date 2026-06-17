import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$postId")({
    component: Outlet
});
