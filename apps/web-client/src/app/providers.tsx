import { QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { PropsWithChildren } from "react";

import { queryClient } from "./query-client";
import { ThemeProvider } from "./theme";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            <QueryErrorResetBoundary>
                <ThemeProvider>
                    <NuqsAdapter>{children}</NuqsAdapter>
                </ThemeProvider>
            </QueryErrorResetBoundary>
        </QueryClientProvider>
    );
}
