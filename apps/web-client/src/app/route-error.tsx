import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@nmm/ui/components";
import { Link, Navigate } from "@tanstack/react-router";
import {
    AlertCircleIcon,
    HomeIcon,
    LockKeyholeIcon,
    RefreshCwIcon,
    SearchXIcon,
    ShieldAlertIcon,
    UserRoundIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";

import { showAuthenticationProblemFlashbar, showGlobalProblemFlashbar } from "./app-flashbar-store";
import { ApiClientError } from "@/shared/api/http-client";

type RouteErrorFallbackProps = {
    error: unknown;
    fallbackDescription: string;
    fallbackTitle: string;
    onRetry: () => void;
};

type RouteErrorView = {
    action: "account" | "home" | "retry";
    description: string;
    icon: LucideIcon;
    requestId?: string;
    title: string;
};

export function RouteErrorFallback({ error, fallbackDescription, fallbackTitle, onRetry }: RouteErrorFallbackProps) {
    if (isApiStatus(error, 401)) {
        return <AuthenticationErrorRedirect />;
    }

    const view = getRouteErrorView(error, {
        description: fallbackDescription,
        title: fallbackTitle
    });
    const Icon = view.icon;

    function handleRetryClick() {
        onRetry();
    }

    return (
        <>
            <GlobalProblemFlashbar description={view.description} title={view.title} />
            <Card className="mx-auto max-w-xl">
                <CardHeader>
                    <Icon className="size-5 text-muted-foreground" />
                    <CardTitle>{view.title}</CardTitle>
                    <CardDescription>{view.description}</CardDescription>
                </CardHeader>
                {view.requestId ? (
                    <CardContent>
                        <CardDescription>Request ID: {view.requestId}</CardDescription>
                    </CardContent>
                ) : null}
                <CardFooter className="gap-2">
                    <RouteErrorAction action={view.action} onRetry={handleRetryClick} />
                </CardFooter>
            </Card>
        </>
    );
}

function AuthenticationErrorRedirect() {
    useEffect(() => {
        showAuthenticationProblemFlashbar();
    }, []);

    return <Navigate to="/login" replace />;
}

function GlobalProblemFlashbar({ description, title }: { description: string; title: string }) {
    useEffect(() => {
        showGlobalProblemFlashbar({ description, title });
    }, [description, title]);

    return null;
}

function RouteErrorAction({ action, onRetry }: { action: RouteErrorView["action"]; onRetry: () => void }) {
    if (action === "account") {
        return (
            <Button asChild>
                <Link to="/login">
                    <UserRoundIcon data-icon="inline-start" />
                    Sign in
                </Link>
            </Button>
        );
    }

    if (action === "home") {
        return (
            <Button asChild variant="outline">
                <Link to="/">
                    <HomeIcon data-icon="inline-start" />
                    Back to dashboard
                </Link>
            </Button>
        );
    }

    return (
        <Button type="button" variant="outline" onClick={onRetry}>
            <RefreshCwIcon data-icon="inline-start" />
            Retry
        </Button>
    );
}

function getRouteErrorView(error: unknown, fallback: Pick<RouteErrorView, "description" | "title">): RouteErrorView {
    if (error instanceof ApiClientError) {
        return getApiRouteErrorView(error, fallback);
    }

    return {
        ...fallback,
        action: "retry",
        icon: AlertCircleIcon
    };
}

function getApiRouteErrorView(
    error: ApiClientError,
    fallback: Pick<RouteErrorView, "description" | "title">
): RouteErrorView {
    if (error.statusCode === 404) {
        return {
            action: "home",
            description: "The item may have been deleted or the address may be wrong.",
            icon: SearchXIcon,
            requestId: error.requestId,
            title: "Page data not found"
        };
    }

    if (error.code === "AUTH_ACCOUNT_SUSPENDED") {
        return {
            action: "account",
            description: "This account is suspended. Contact an administrator for access.",
            icon: ShieldAlertIcon,
            requestId: error.requestId,
            title: "Account suspended"
        };
    }

    if (error.statusCode === 403) {
        return {
            action: "home",
            description: "You do not have permission to open this workspace page.",
            icon: LockKeyholeIcon,
            requestId: error.requestId,
            title: "Access denied"
        };
    }

    return {
        ...fallback,
        action: "retry",
        icon: AlertCircleIcon,
        requestId: error.requestId
    };
}

function isApiStatus(error: unknown, statusCode: number) {
    return error instanceof ApiClientError && error.statusCode === statusCode;
}
