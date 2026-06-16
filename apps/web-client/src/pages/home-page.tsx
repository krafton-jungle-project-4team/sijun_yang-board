import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Separator
} from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";

import { useCurrentUserQuery } from "../features/auth/api/auth-queries";
import { isActiveUser } from "../features/auth/model/user-status";
import { useDashboard } from "../features/dashboard/hooks/use-dashboard";
import { taskPriorityLabels, taskStatusLabels } from "../features/projects/model/project-labels";
import { approvalRequestStatusLabels } from "../features/requests/model/request-labels";

export function HomePage() {
    const currentUserQuery = useCurrentUserQuery();
    const currentUser = currentUserQuery.data;
    const dashboardQuery = useDashboard(isActiveUser(currentUser));

    if (currentUserQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Loading account...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!isActiveUser(currentUser)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Operations dashboard</CardTitle>
                    <CardDescription>Sign in to view operations work.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link to="/me">Open account</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (dashboardQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Loading operations snapshot...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (dashboardQuery.isError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Could not load the operations snapshot.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const dashboard = dashboardQuery.data;

    return (
        <div className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <CardHeader className="min-w-0 flex-1 px-0">
                    <CardTitle>Operations dashboard</CardTitle>
                    <CardDescription>Server-state operations snapshot.</CardDescription>
                </CardHeader>
                <Button asChild>
                    <Link to="/projects">Open projects</Link>
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{dashboard.activeProjectCount}</CardTitle>
                        <CardDescription>Active projects</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{dashboard.inProgressTaskCount}</CardTitle>
                        <CardDescription>Tasks in progress</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My tasks</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                    {dashboard.myTasks.map((task) => (
                        <div key={task.id} className="grid gap-1">
                            <Link
                                to="/projects/$projectId/tasks/$taskId"
                                params={{ projectId: String(task.projectId), taskId: String(task.id) }}
                            >
                                {task.title}
                            </Link>
                            <CardDescription>
                                {task.projectName} · {taskStatusLabels[task.status]} ·{" "}
                                {taskPriorityLabels[task.priority]}
                            </CardDescription>
                        </div>
                    ))}
                    {dashboard.myTasks.length === 0 ? <CardDescription>No assigned open tasks.</CardDescription> : null}
                </CardContent>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending approvals</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {dashboard.pendingRequests.map((request) => (
                            <div key={request.id} className="grid gap-1">
                                <Link to="/requests/$requestId" params={{ requestId: String(request.id) }}>
                                    {request.title}
                                </Link>
                                <CardDescription>
                                    {request.projectName} · {approvalRequestStatusLabels[request.status]}
                                </CardDescription>
                            </div>
                        ))}
                        {dashboard.pendingRequests.length === 0 ? (
                            <CardDescription>No pending approvals.</CardDescription>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent announcements</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {dashboard.recentAnnouncements.map((post) => (
                            <div key={post.id} className="grid gap-1">
                                <Link to="/posts/$postId" params={{ postId: String(post.id) }}>
                                    {post.title}
                                </Link>
                                <CardDescription>
                                    {post.commentCount} comments · {post.viewCount} views
                                </CardDescription>
                            </div>
                        ))}
                        {dashboard.recentAnnouncements.length === 0 ? (
                            <CardDescription>No announcements yet.</CardDescription>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            <Separator />
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React Query server state</Badge>
                <Badge variant="outline">nuqs URL lists</Badge>
                <Badge variant="outline">RHF forms</Badge>
            </div>
        </div>
    );
}
