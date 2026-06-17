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
import { ListChecksIcon, NewspaperIcon, PlusIcon, SquarePenIcon, TrendingUpIcon } from "lucide-react";
import type { ReactNode } from "react";

type PostWorkspaceShellProps = {
    children: ReactNode;
};

export function PostWorkspaceShell({ children }: PostWorkspaceShellProps) {
    const { pathname, search } = useRouterState({
        select: (state) => ({
            pathname: state.location.pathname,
            search: state.location.search as Record<string, unknown>
        })
    });
    const currentPostId = getCurrentPostId(pathname);
    const currentPostSort = getPostSortSearchValue(search.sort);
    const isIndexRoute = pathname === "/posts";
    const isNewRoute = pathname === "/posts/new";
    const isAllPostsRoute = isIndexRoute && currentPostSort === "latest";
    const isPopularPostsRoute = isIndexRoute && currentPostSort === "popular";
    const currentPostPath = currentPostId ? `/posts/${currentPostId}` : null;
    const currentPostEditPath = currentPostPath ? `${currentPostPath}/edit` : null;
    const isEditRoute = currentPostEditPath ? pathname === currentPostEditPath : false;

    return (
        <SidebarProvider className="!min-h-0 overflow-hidden rounded-md border md:h-[calc(100svh-12rem)] md:!min-h-[32rem]">
            <Sidebar collapsible="none" className="hidden self-stretch border-r md:flex">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild size="lg" isActive={pathname.startsWith("/posts")}>
                                <Link to="/posts">
                                    <NewspaperIcon />
                                    <span>Announcements</span>
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
                                    <SidebarMenuButton asChild isActive={isAllPostsRoute}>
                                        <Link
                                            to="/posts"
                                            search={{
                                                displayView: "table",
                                                page: 1,
                                                search: "",
                                                sort: "latest"
                                            }}
                                        >
                                            <ListChecksIcon />
                                            <span>All announcements</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isPopularPostsRoute}>
                                        <Link
                                            to="/posts"
                                            search={{
                                                displayView: "table",
                                                page: 1,
                                                search: "",
                                                sort: "popular"
                                            }}
                                        >
                                            <TrendingUpIcon />
                                            <span>Popular</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isNewRoute}>
                                        <Link to="/posts/new">
                                            <PlusIcon />
                                            <span>New announcement</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {currentPostId && currentPostPath ? (
                        <>
                            <SidebarSeparator />
                            <SidebarGroup>
                                <SidebarGroupLabel>Current announcement</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === currentPostPath}>
                                                <Link to="/posts/$postId" params={{ postId: currentPostId }}>
                                                    <NewspaperIcon />
                                                    <span>Detail</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        {isEditRoute ? (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton type="button" isActive>
                                                    <SquarePenIcon />
                                                    <span>Editing</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ) : null}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </>
                    ) : null}
                </SidebarContent>
                <SidebarFooter>
                    <span className="px-2 text-xs text-sidebar-foreground/70">Announcement workspace</span>
                </SidebarFooter>
            </Sidebar>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
                <div className="grid gap-4 md:hidden">
                    <CardHeader className="px-0">
                        <CardTitle>Announcements</CardTitle>
                        <CardDescription>Updates, notes, comments, views.</CardDescription>
                    </CardHeader>
                    <ButtonGroup>
                        <Button asChild variant={isIndexRoute ? "secondary" : "outline"}>
                            <Link to="/posts">
                                <ListChecksIcon data-icon="inline-start" />
                                All announcements
                            </Link>
                        </Button>
                        <Button asChild variant={isNewRoute ? "secondary" : "outline"}>
                            <Link to="/posts/new">
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

function getCurrentPostId(pathname: string) {
    const [, workspace, postId] = pathname.split("/");

    if (workspace !== "posts" || !postId || postId === "new") {
        return null;
    }

    const numericPostId = Number(postId);

    return Number.isInteger(numericPostId) && numericPostId > 0 ? postId : null;
}

function getPostSortSearchValue(value: unknown) {
    return value === "popular" ? "popular" : "latest";
}
