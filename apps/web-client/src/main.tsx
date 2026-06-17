import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "./app/providers";
import { queryClient } from "./app/query-client";
import { router } from "./app/router";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found.");
}

createRoot(rootElement).render(
    <StrictMode>
        <AppProviders>
            <RouterProvider router={router} context={{ queryClient }} />
        </AppProviders>
    </StrictMode>
);
