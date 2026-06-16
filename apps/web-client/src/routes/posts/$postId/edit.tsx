import { createFileRoute } from "@tanstack/react-router";

import { createRouteBoundaryOptions } from "../../../app/route-boundary";
import { EditPostPage } from "../../../pages/posts/edit-post-page";

const routeBoundaryOptions = createRouteBoundaryOptions({
    errorDescription: "Could not load the announcement editor.",
    errorTitle: "Announcement editor unavailable",
    pendingDescription: "Loading announcement editor...",
    pendingTitle: "Edit announcement"
});

export const Route = createFileRoute("/posts/$postId/edit")({
    component: EditPostPage,
    ...routeBoundaryOptions
});
