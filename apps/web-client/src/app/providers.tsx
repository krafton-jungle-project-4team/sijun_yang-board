import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { PropsWithChildren } from "react";

import { queryClient } from "./query-client";
import { ThemeProvider } from "./theme";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
