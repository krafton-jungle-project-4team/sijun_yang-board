import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "@/app/route-boundary";
import { ProjectDetailPage } from "@/pages/projects/project-detail-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load this project.",
    errorTitle: "Project unavailable",
    pendingDescription: "Loading project...",
    pendingTitle: "Project"
});

export const Route = createFileRoute("/projects/$projectId/")({
    component: ProjectDetailPage,
    ...routeBoundaryOptions
});
