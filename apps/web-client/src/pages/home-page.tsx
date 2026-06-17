import {
    Badge,
    Button,
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemSeparator,
    ItemTitle
} from "@nmm/ui/components";
import type { Dashboard } from "@nmm/shared";
import { Link } from "@tanstack/react-router";
import {
    ArrowRightIcon,
    CheckCircle2Icon,
    ClipboardCheckIcon,
    FolderKanbanIcon,
    ListChecksIcon,
    MegaphoneIcon,
    PlusIcon,
    UserRoundCheckIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useSuspenseCurrentUserQuery } from "@/features/auth/api/auth-queries";
import { isSignedInUser } from "@/features/auth/model/current-user";
import { useSuspenseDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { taskPriorityLabels, taskStatusLabels } from "@/features/projects/model/project-labels";
import { approvalRequestStatusLabels } from "@/features/requests/model/request-labels";

type MetricCardProps = {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
};

type DashboardTask = Dashboard["myTasks"][number];
type DashboardRequest = Dashboard["pendingRequests"][number];
type DashboardPost = Dashboard["recentAnnouncements"][number];

export function HomePage() {
    const currentUser = useSuspenseCurrentUserQuery().data;

    if (!isSignedInUser(currentUser)) {
        return <SignedOutDashboard />;
    }

    return <DashboardContent />;
}

function DashboardContent() {
    const dashboard = useSuspenseDashboard().data;
    const openWorkCount = dashboard.myTasks.length + dashboard.pendingRequests.length;
    const metricCards: MetricCardProps[] = [
        {
            title: "Active projects",
            value: dashboard.activeProjectCount,
            description: "Projects currently moving",
            icon: FolderKanbanIcon
        },
        {
            title: "Tasks in progress",
            value: dashboard.inProgressTaskCount,
            description: "Work items underway",
            icon: ListChecksIcon
        },
        {
            title: "Assigned to me",
            value: dashboard.myTasks.length,
            description: "Open personal tasks",
            icon: UserRoundCheckIcon
        },
        {
            title: "Needs review",
            value: dashboard.pendingRequests.length,
            description: "Approval requests waiting",
            icon: ClipboardCheckIcon
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex max-w-2xl flex-col gap-2">
                    <Badge variant="outline">Operations</Badge>
                    <h1 className="text-3xl font-semibold tracking-tight">Operations dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Review projects, assigned work, approval requests, and announcements.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link to="/requests/new">
                            <PlusIcon data-icon="inline-start" />
                            New request
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to="/projects">
                            Open projects
                            <ArrowRightIcon data-icon="inline-end" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((metric) => (
                    <MetricCard key={metric.title} {...metric} />
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <TaskListCard tasks={dashboard.myTasks} />
                <ApprovalListCard requests={dashboard.pendingRequests} />
            </div>

            <Card>
                <CardHeader className="border-b">
                    <CardTitle>Recent announcements</CardTitle>
                    <CardDescription>Latest updates from the workspace.</CardDescription>
                    <CardAction>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/posts">View all</Link>
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <AnnouncementList posts={dashboard.recentAnnouncements} />
                </CardContent>
                <CardFooter className="border-t">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{openWorkCount} open items</Badge>
                        <Badge variant="outline">{dashboard.recentAnnouncements.length} recent posts</Badge>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

function SignedOutDashboard() {
    return (
        <Card className="mx-auto max-w-3xl">
            <CardHeader className="border-b">
                <Badge variant="outline">Operations workspace</Badge>
                <CardTitle>Sign in to view operations work</CardTitle>
                <CardDescription>Open your account to see projects, approvals, and announcements.</CardDescription>
            </CardHeader>
            <CardContent>
                <ItemGroup className="gap-2">
                    <Item variant="muted">
                        <ItemMedia variant="icon">
                            <FolderKanbanIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Projects</ItemTitle>
                            <ItemDescription>Track active delivery work.</ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="muted">
                        <ItemMedia variant="icon">
                            <ClipboardCheckIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Approvals</ItemTitle>
                            <ItemDescription>Review requests that need a decision.</ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="muted">
                        <ItemMedia variant="icon">
                            <MegaphoneIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Announcements</ItemTitle>
                            <ItemDescription>Catch up on workspace updates.</ItemDescription>
                        </ItemContent>
                    </Item>
                </ItemGroup>
            </CardContent>
            <CardFooter>
                <Button asChild>
                    <Link to="/login">
                        Sign in
                        <ArrowRightIcon data-icon="inline-end" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function MetricCard({ title, value, description, icon: Icon }: MetricCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{value.toLocaleString()}</CardTitle>
                <CardDescription>{title}</CardDescription>
                <CardAction>
                    <Badge variant="secondary">
                        <Icon />
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter>
                <CardDescription>{description}</CardDescription>
            </CardFooter>
        </Card>
    );
}

function TaskListCard({ tasks }: { tasks: DashboardTask[] }) {
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>My tasks</CardTitle>
                <CardDescription>{tasks.length} assigned open tasks.</CardDescription>
                <CardAction>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/projects">View projects</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>{tasks.length > 0 ? <TaskList tasks={tasks} /> : <EmptyTasks />}</CardContent>
        </Card>
    );
}

function TaskList({ tasks }: { tasks: DashboardTask[] }) {
    return (
        <ItemGroup>
            {tasks.map((task, index) => (
                <TaskListItem key={task.id} task={task} showSeparator={index < tasks.length - 1} />
            ))}
        </ItemGroup>
    );
}

function TaskListItem({ task, showSeparator }: { task: DashboardTask; showSeparator: boolean }) {
    return (
        <>
            <Item>
                <ItemMedia variant="icon">
                    <ListChecksIcon />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>
                        <Link
                            to="/projects/$projectId/tasks/$taskId"
                            params={{ projectId: String(task.projectId), taskId: String(task.id) }}
                        >
                            {task.title}
                        </Link>
                    </ItemTitle>
                    <ItemDescription>{task.projectName}</ItemDescription>
                </ItemContent>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{taskStatusLabels[task.status]}</Badge>
                    <Badge variant="outline">{taskPriorityLabels[task.priority]}</Badge>
                </div>
            </Item>
            {showSeparator ? <ItemSeparator /> : null}
        </>
    );
}

function ApprovalListCard({ requests }: { requests: DashboardRequest[] }) {
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>Pending approvals</CardTitle>
                <CardDescription>{requests.length} requests waiting for review.</CardDescription>
                <CardAction>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/requests">View requests</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>{requests.length > 0 ? <ApprovalList requests={requests} /> : <EmptyApprovals />}</CardContent>
        </Card>
    );
}

function ApprovalList({ requests }: { requests: DashboardRequest[] }) {
    return (
        <ItemGroup>
            {requests.map((request, index) => (
                <ApprovalListItem key={request.id} request={request} showSeparator={index < requests.length - 1} />
            ))}
        </ItemGroup>
    );
}

function ApprovalListItem({ request, showSeparator }: { request: DashboardRequest; showSeparator: boolean }) {
    return (
        <>
            <Item>
                <ItemMedia variant="icon">
                    <ClipboardCheckIcon />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>
                        <Link to="/requests/$requestId" params={{ requestId: String(request.id) }}>
                            {request.title}
                        </Link>
                    </ItemTitle>
                    <ItemDescription>{request.projectName}</ItemDescription>
                </ItemContent>
                <Badge variant="secondary">{approvalRequestStatusLabels[request.status]}</Badge>
            </Item>
            {showSeparator ? <ItemSeparator /> : null}
        </>
    );
}

function AnnouncementList({ posts }: { posts: DashboardPost[] }) {
    if (posts.length === 0) {
        return <EmptyAnnouncements />;
    }

    return (
        <ItemGroup>
            {posts.map((post, index) => (
                <AnnouncementListItem key={post.id} post={post} showSeparator={index < posts.length - 1} />
            ))}
        </ItemGroup>
    );
}

function AnnouncementListItem({ post, showSeparator }: { post: DashboardPost; showSeparator: boolean }) {
    return (
        <>
            <Item>
                <ItemMedia variant="icon">
                    <MegaphoneIcon />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>
                        <Link to="/posts/$postId" params={{ postId: String(post.id) }}>
                            {post.title}
                        </Link>
                    </ItemTitle>
                    <ItemDescription>{post.excerpt}</ItemDescription>
                </ItemContent>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{post.commentCount} comments</Badge>
                    <Badge variant="outline">{post.viewCount} views</Badge>
                </div>
            </Item>
            {showSeparator ? <ItemSeparator /> : null}
        </>
    );
}

function EmptyTasks() {
    return (
        <Empty className="border bg-muted/20 py-8 md:p-8">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CheckCircle2Icon />
                </EmptyMedia>
                <EmptyTitle>No assigned tasks</EmptyTitle>
                <EmptyDescription>Assigned open work will appear here.</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

function EmptyApprovals() {
    return (
        <Empty className="border bg-muted/20 py-8 md:p-8">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CheckCircle2Icon />
                </EmptyMedia>
                <EmptyTitle>No pending approvals</EmptyTitle>
                <EmptyDescription>Requests waiting for review will appear here.</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

function EmptyAnnouncements() {
    return (
        <Empty className="border bg-muted/20 py-8 md:p-8">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CheckCircle2Icon />
                </EmptyMedia>
                <EmptyTitle>No announcements yet</EmptyTitle>
                <EmptyDescription>Workspace updates will appear here.</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
