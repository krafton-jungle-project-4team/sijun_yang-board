import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../app/route-boundary";
import { SignupPage } from "../pages/auth/signup-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load account creation.",
    errorTitle: "Signup unavailable",
    pendingDescription: "Loading signup...",
    pendingTitle: "Create account"
});

export const Route = createFileRoute("/signup")({
    component: SignupPage,
    ...routeBoundaryOptions
});
