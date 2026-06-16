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
    ClipboardCheckIcon,
    FileCheckIcon,
    FolderKanbanIcon,
    ListChecksIcon,
    NewspaperIcon,
    PlusIcon
} from "lucide-react";
import type { ReactNode } from "react";

type RequestWorkspaceShellProps = {
    children: ReactNode;
};

export function RequestWorkspaceShell({ children }: RequestWorkspaceShellProps) {
    const pathname = useRouterState({
        select: (state) => state.location.pathname
    });
    const currentRequestId = getCurrentRequestId(pathname);
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
                                    <SidebarMenuButton asChild isActive={isIndexRoute}>
                                        <Link to="/requests">
                                            <ListChecksIcon />
                                            <span>All requests</span>
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

                    <SidebarSeparator />
                    <SidebarGroup>
                        <SidebarGroupLabel>Related</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to="/projects">
                                            <FolderKanbanIcon />
                                            <span>Projects</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to="/posts">
                                            <NewspaperIcon />
                                            <span>Announcements</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
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
