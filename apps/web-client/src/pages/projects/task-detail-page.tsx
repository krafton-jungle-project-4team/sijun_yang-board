import type { TaskStatus } from "@nmm/shared";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { useCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { useTask, useUpdateTask } from "../../features/projects/hooks/use-projects";
import { taskPriorityLabels, taskStatusLabels } from "../../features/projects/model/project-labels";
import { canChangeTaskStatus } from "../../features/projects/model/project-permissions";
import { TaskStatusControl } from "../../features/projects/ui/task-status-control";

export function TaskDetailPage() {
    const params = useParams({ strict: false }) as { projectId: string; taskId: string };
    const projectId = Number(params.projectId);
    const taskId = Number(params.taskId);
    const currentUser = useCurrentUserQuery().data;
    const taskQuery = useTask(taskId);
    const updateTask = useUpdateTask(projectId, taskId);

    function handleTaskStatusChange(status: TaskStatus) {
        updateTask.mutate({ status });
    }

    if (!Number.isInteger(projectId) || projectId <= 0 || !Number.isInteger(taskId) || taskId <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid task.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (taskQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Loading task...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (taskQuery.isError) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Could not load task.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const task = taskQuery.data;
    const canUpdateStatus = canChangeTaskStatus(currentUser, task);

    return (
        <article className="grid gap-5">
            <div>
                <Button asChild variant="ghost">
                    <Link to="/projects/$projectId" params={{ projectId: String(projectId) }}>
                        <ArrowLeft />
                        Project
                    </Link>
                </Button>
            </div>
            <CardHeader className="px-0">
                <Badge variant="secondary">{task.projectName}</Badge>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>
                    {task.assigneeName ?? "Unassigned"} · {taskPriorityLabels[task.priority]}
                </CardDescription>
            </CardHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Status</CardTitle>
                    <CardDescription>{taskStatusLabels[task.status]}</CardDescription>
                </CardHeader>
                <CardContent>
                    {canUpdateStatus ? (
                        <TaskStatusControl
                            disabled={updateTask.isPending}
                            status={task.status}
                            onChange={handleTaskStatusChange}
                        />
                    ) : (
                        <Badge variant="secondary">{taskStatusLabels[task.status]}</Badge>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-7">{task.description}</p>
                </CardContent>
            </Card>
        </article>
    );
}
