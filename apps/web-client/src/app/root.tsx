import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "@nmm/ui/components";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
    ClipboardCheckIcon,
    FolderKanbanIcon,
    LayoutDashboardIcon,
    MenuIcon,
    NewspaperIcon,
    PanelTopIcon,
    UserRoundIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { RouteErrorFallback } from "./route-error";
import { ThemeToggle } from "./theme-toggle";

type AppRoutePath = "/" | "/posts" | "/projects" | "/requests" | "/me";

type NavigationItem = {
    to: AppRoutePath;
    label: string;
    icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
    {
        to: "/",
        label: "Dashboard",
        icon: LayoutDashboardIcon
    },
    {
        to: "/posts",
        label: "Announcements",
        icon: NewspaperIcon
    },
    {
        to: "/projects",
        label: "Projects",
        icon: FolderKanbanIcon
    },
    {
        to: "/requests",
        label: "Requests",
        icon: ClipboardCheckIcon
    },
    {
        to: "/me",
        label: "Me",
        icon: UserRoundIcon
    }
];

function isNavigationItemActive(pathname: string, to: AppRoutePath) {
    return to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
}

export function RootLayout() {
    const pathname = useRouterState({
        select: (state) => state.location.pathname
    });

    return (
        <div className="flex min-h-svh flex-col bg-background text-foreground">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
                    <Button asChild variant="ghost" className="px-2">
                        <Link to="/" aria-label="OpsDesk dashboard">
                            <PanelTopIcon data-icon="inline-start" />
                            <span className="font-semibold">OpsDesk</span>
                        </Link>
                    </Button>
                    <NavigationMenu viewport={false} className="hidden md:flex">
                        <NavigationMenuList>
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.to}>
                                    <NavigationMenuLink asChild active={isNavigationItemActive(pathname, item.to)}>
                                        <Link to={item.to}>{item.label}</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <MobileNavigation pathname={pathname} />
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
                <Outlet />
            </main>
            <footer className="border-t bg-muted/30">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">OpsDesk</span>
                        <span className="text-sm text-muted-foreground">
                            Projects, approvals, and announcements in one workspace.
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                        {navigationItems.map((item) => (
                            <Button key={item.to} asChild variant="ghost" size="sm">
                                <Link to={item.to}>{item.label}</Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}

function MobileNavigation({ pathname }: { pathname: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="md:hidden"
                    aria-label="Open navigation"
                >
                    <MenuIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isNavigationItemActive(pathname, item.to);

                        return (
                            <DropdownMenuItem key={item.to} asChild>
                                <Link to={item.to} aria-current={isActive ? "page" : undefined}>
                                    <Icon />
                                    {item.label}
                                </Link>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function RootError({ error, reset }: ErrorComponentProps) {
    const queryErrorResetBoundary = useQueryErrorResetBoundary();

    function handleRetry() {
        queryErrorResetBoundary.reset();
        reset();
    }

    return (
        <RouteErrorFallback
            error={error}
            fallbackTitle="Something went wrong"
            fallbackDescription="Refresh the page or try again later."
            onRetry={handleRetry}
        />
    );
}

export function RootNotFound() {
    return (
        <Card className="mx-auto max-w-xl">
            <CardHeader>
                <CardTitle>Page not found</CardTitle>
                <CardDescription>Open a workspace page from the navigation.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="outline">
                    <Link to="/">Back to dashboard</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
