import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "@/app/route-boundary";
import { RequestDetailPage } from "@/pages/requests/request-detail-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load this request.",
    errorTitle: "Request unavailable",
    pendingDescription: "Loading request...",
    pendingTitle: "Request"
});

export const Route = createFileRoute("/requests/$requestId")({
    component: RequestDetailPage,
    ...routeBoundaryOptions
});
