import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../../app/route-boundary";
import { ProjectsPage } from "../../pages/projects/projects-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load projects.",
    errorTitle: "Projects unavailable",
    pendingDescription: "Loading projects...",
    pendingRows: 4,
    pendingTitle: "Projects"
});

export const Route = createFileRoute("/projects/")({
    component: ProjectsPage,
    ...routeBoundaryOptions
});
