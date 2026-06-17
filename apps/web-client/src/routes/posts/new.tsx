import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "@/app/route-boundary";
import { NewPostPage } from "@/pages/posts/new-post-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not open the announcement form.",
    errorTitle: "Announcement form unavailable",
    pendingDescription: "Loading announcement form...",
    pendingTitle: "New announcement"
});

export const Route = createFileRoute("/posts/new")({
    component: NewPostPage,
    ...routeBoundaryOptions
});
