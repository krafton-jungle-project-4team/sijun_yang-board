import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../../../../app/route-boundary";
import { TaskDetailPage } from "../../../../pages/projects/task-detail-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load this task.",
    errorTitle: "Task unavailable",
    pendingDescription: "Loading task...",
    pendingTitle: "Task"
});

export const Route = createFileRoute("/projects/$projectId/tasks/$taskId")({
    component: TaskDetailPage,
    ...routeBoundaryOptions
});
