import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "@/app/route-boundary";
import { HomePage } from "@/pages/home-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load the operations snapshot.",
    errorTitle: "Dashboard unavailable",
    pendingDescription: "Loading operations snapshot...",
    pendingRows: 4,
    pendingTitle: "Dashboard"
});

export const Route = createFileRoute("/")({
    component: HomePage,
    ...routeBoundaryOptions
});
