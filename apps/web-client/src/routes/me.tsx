import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../app/route-boundary";
import { MePage } from "../pages/auth/me-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load account information.",
    errorTitle: "Account unavailable",
    pendingDescription: "Loading account...",
    pendingTitle: "My account"
});

export const Route = createFileRoute("/me")({
    component: MePage,
    ...routeBoundaryOptions
});
