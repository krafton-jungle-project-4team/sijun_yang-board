import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../../app/route-boundary";
import { PostsPage } from "../../pages/posts/posts-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load announcements.",
    errorTitle: "Announcements unavailable",
    pendingDescription: "Loading announcements...",
    pendingRows: 4,
    pendingTitle: "Announcements"
});

export const Route = createFileRoute("/posts/")({
    component: PostsPage,
    ...routeBoundaryOptions
});
