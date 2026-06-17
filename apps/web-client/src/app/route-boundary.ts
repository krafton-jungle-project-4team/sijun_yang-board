import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@nmm/ui/components";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorComponentProps, type ErrorRouteComponent, type RouteComponent } from "@tanstack/react-router";
import { createElement, type ReactNode } from "react";

import { RouteErrorFallback } from "./route-error";

type RouteFallbackOptions = {
    description: string;
    rows?: 1 | 2 | 3 | 4;
    title: string;
};

type RouteBoundaryOptions = {
    errorDescription: string;
    errorTitle: string;
    pendingDescription: string;
    pendingRows?: 1 | 2 | 3 | 4;
    pendingTitle: string;
};

const fallbackRows = ["first", "second", "third", "fourth"] as const;

export function createRouteBoundaryOptions(options: RouteBoundaryOptions) {
    const pendingComponent: RouteComponent = function RoutePendingComponent() {
        return renderRoutePendingFallback({
            description: options.pendingDescription,
            rows: options.pendingRows,
            title: options.pendingTitle
        });
    };

    const errorComponent: ErrorRouteComponent = function RouteErrorComponent({ error, reset }: ErrorComponentProps) {
        const queryErrorResetBoundary = useQueryErrorResetBoundary();

        function handleRetry() {
            queryErrorResetBoundary.reset();
            reset();
        }

        return createElement(RouteErrorFallback, {
            error,
            fallbackDescription: options.errorDescription,
            fallbackTitle: options.errorTitle,
            onRetry: handleRetry
        });
    };

    return {
        errorComponent,
        pendingComponent,
        wrapInSuspense: true as const
    };
}

function renderRoutePendingFallback({ description, rows = 3, title }: RouteFallbackOptions) {
    return createElement(
        Card,
        null,
        createElement(
            CardHeader,
            null,
            createElement(CardTitle, null, title),
            createElement(CardDescription, null, description)
        ),
        createElement(CardContent, { className: "grid gap-3 md:grid-cols-2" }, renderSkeletonRows(rows))
    );
}

function renderSkeletonRows(rowCount: 1 | 2 | 3 | 4) {
    const rows: ReactNode[] = [];

    for (const row of fallbackRows) {
        if (rows.length >= rowCount) {
            break;
        }

        rows.push(createElement(Skeleton, { key: row, className: "h-28" }));
    }

    return rows;
}
