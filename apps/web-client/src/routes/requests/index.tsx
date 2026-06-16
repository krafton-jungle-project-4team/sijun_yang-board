import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../../app/route-boundary";
import { RequestsPage } from "../../pages/requests/requests-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load requests.",
    errorTitle: "Requests unavailable",
    pendingDescription: "Loading requests...",
    pendingRows: 4,
    pendingTitle: "Requests"
});

export const Route = createFileRoute("/requests/")({
    component: RequestsPage,
    ...routeBoundaryOptions
});
