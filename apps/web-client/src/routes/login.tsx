import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../app/route-boundary";
import { LoginPage } from "../pages/auth/login-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load sign-in.",
    errorTitle: "Sign-in unavailable",
    pendingDescription: "Loading sign-in...",
    pendingTitle: "Sign in"
});

export const Route = createFileRoute("/login")({
    component: LoginPage,
    ...routeBoundaryOptions
});
