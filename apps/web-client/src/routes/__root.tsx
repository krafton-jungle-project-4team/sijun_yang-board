import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

import { RootError, RootLayout, RootNotFound } from "@/app/root";

type RouterContext = {
    queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
    errorComponent: RootError,
    notFoundComponent: RootNotFound
});
