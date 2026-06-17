import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "@/app/route-boundary";
import { NewRequestPage } from "@/pages/requests/new-request-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not open the request form.",
    errorTitle: "Request form unavailable",
    pendingDescription: "Loading request form...",
    pendingTitle: "New request"
});

export const Route = createFileRoute("/requests/new")({
    component: NewRequestPage,
    ...routeBoundaryOptions
});
