import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../../../app/route-boundary";
import { EditProjectPage } from "../../../pages/projects/edit-project-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load the project editor.",
    errorTitle: "Project editor unavailable",
    pendingDescription: "Loading project editor...",
    pendingTitle: "Edit project"
});

export const Route = createFileRoute("/projects/$projectId/edit")({
    component: EditProjectPage,
    ...routeBoundaryOptions
});
