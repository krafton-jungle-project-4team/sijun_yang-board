import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../../app/route-boundary";
import { NewProjectPage } from "../../pages/projects/new-project-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not open the project form.",
    errorTitle: "Project form unavailable",
    pendingDescription: "Loading project form...",
    pendingTitle: "New project"
});

export const Route = createFileRoute("/projects/new")({
    component: NewProjectPage,
    ...routeBoundaryOptions
});
