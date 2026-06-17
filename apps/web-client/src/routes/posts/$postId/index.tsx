import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "@/app/route-boundary";
import { PostDetailPage } from "@/pages/posts/post-detail-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load this announcement.",
    errorTitle: "Announcement unavailable",
    pendingDescription: "Loading announcement...",
    pendingTitle: "Announcement"
});

export const Route = createFileRoute("/posts/$postId/")({
    component: PostDetailPage,
    ...routeBoundaryOptions
});
