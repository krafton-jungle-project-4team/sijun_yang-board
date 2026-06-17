import {
    Button,
    ButtonGroup,
    CardDescription,
    CardHeader,
    CardTitle,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator
} from "@nmm/ui/components";
import { Link, useRouterState } from "@tanstack/react-router";
import {
    CheckCircle2Icon,
    ClipboardCheckIcon,
    Clock3Icon,
    FileCheckIcon,
    ListChecksIcon,
    PlusIcon,
    XCircleIcon
} from "lucide-react";
import type { ReactNode } from "react";

type RequestWorkspaceShellProps = {
    children: ReactNode;
};

export function RequestWorkspaceShell({ children }: RequestWorkspaceShellProps) {
    const { pathname, search } = useRouterState({
        select: (state) => ({
            pathname: state.location.pathname,
            search: state.location.search as Record<string, unknown>
        })
    });
    const currentRequestId = getCurrentRequestId(pathname);
    const currentRequestStatus = getRequestStatusSearchValue(search.status);
    const isIndexRoute = pathname === "/requests";
    const isNewRoute = pathname === "/requests/new";
    const currentRequestPath = currentRequestId ? `/requests/${currentRequestId}` : null;

    return (
        <SidebarProvider className="!min-h-0 overflow-hidden rounded-md border md:h-[calc(100svh-12rem)] md:!min-h-[32rem]">
            <Sidebar collapsible="none" className="hidden self-stretch border-r md:flex">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild size="lg" isActive={pathname.startsWith("/requests")}>
                                <Link to="/requests">
                                    <ClipboardCheckIcon />
                                    <span>Requests</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentRequestStatus === "ALL"}
                                    >
                                        <Link
                                            to="/requests"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "ALL"
                                            }}
                                        >
                                            <ListChecksIcon />
                                            <span>All requests</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentRequestStatus === "PENDING"}
                                    >
                                        <Link
                                            to="/requests"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "PENDING"
                                            }}
                                        >
                                            <Clock3Icon />
                                            <span>Pending</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentRequestStatus === "APPROVED"}
                                    >
                                        <Link
                                            to="/requests"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "APPROVED"
                                            }}
                                        >
                                            <CheckCircle2Icon />
                                            <span>Approved</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isIndexRoute && currentRequestStatus === "REJECTED"}
                                    >
                                        <Link
                                            to="/requests"
                                            search={{
                                                page: 1,
                                                search: "",
                                                sort: "latest",
                                                status: "REJECTED"
                                            }}
                                        >
                                            <XCircleIcon />
                                            <span>Rejected</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isNewRoute}>
                                        <Link to="/requests/new">
                                            <PlusIcon />
                                            <span>New request</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {currentRequestId && currentRequestPath ? (
                        <>
                            <SidebarSeparator />
                            <SidebarGroup>
                                <SidebarGroupLabel>Current request</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === currentRequestPath}>
                                                <Link
                                                    to="/requests/$requestId"
                                                    params={{ requestId: currentRequestId }}
                                                >
                                                    <FileCheckIcon />
                                                    <span>Detail</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </>
                    ) : null}
                </SidebarContent>
                <SidebarFooter>
                    <span className="px-2 text-xs text-sidebar-foreground/70">Request workspace</span>
                </SidebarFooter>
            </Sidebar>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
                <div className="grid gap-4 md:hidden">
                    <CardHeader className="px-0">
                        <CardTitle>Requests</CardTitle>
                        <CardDescription>Project-linked approvals and review state.</CardDescription>
                    </CardHeader>
                    <ButtonGroup>
                        <Button asChild variant={isIndexRoute ? "secondary" : "outline"}>
                            <Link to="/requests">
                                <ListChecksIcon data-icon="inline-start" />
                                All requests
                            </Link>
                        </Button>
                        <Button asChild variant={isNewRoute ? "secondary" : "outline"}>
                            <Link to="/requests/new">
                                <PlusIcon data-icon="inline-start" />
                                New
                            </Link>
                        </Button>
                    </ButtonGroup>
                </div>
                {children}
            </div>
        </SidebarProvider>
    );
}

function getCurrentRequestId(pathname: string) {
    const [, workspace, requestId] = pathname.split("/");

    if (workspace !== "requests" || !requestId || requestId === "new") {
        return null;
    }

    const numericRequestId = Number(requestId);

    return Number.isInteger(numericRequestId) && numericRequestId > 0 ? requestId : null;
}

function getRequestStatusSearchValue(value: unknown) {
    switch (value) {
        case "PENDING":
        case "APPROVED":
        case "REJECTED":
            return value;
        default:
            return "ALL";
    }
}
