import type { TaskStatus } from "@nmm/shared";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { useParams } from "@tanstack/react-router";

import { useSuspenseCurrentUserQuery } from "@/features/auth/api/auth-queries";
import { useSuspenseTask, useUpdateTask } from "@/features/projects/hooks/use-projects";
import { taskPriorityLabels, taskStatusLabels } from "@/features/projects/model/project-labels";
import { canChangeTaskStatus } from "@/features/projects/model/project-permissions";
import { TaskStatusControl } from "@/features/projects/ui/task-status-control";

export function TaskDetailPage() {
    const params = useParams({ strict: false }) as { projectId: string; taskId: string };
    const projectId = Number(params.projectId);
    const taskId = Number(params.taskId);

    if (!Number.isInteger(projectId) || projectId <= 0 || !Number.isInteger(taskId) || taskId <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid task.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return <TaskDetailContent projectId={projectId} taskId={taskId} />;
}

function TaskDetailContent({ projectId, taskId }: { projectId: number; taskId: number }) {
    const currentUser = useSuspenseCurrentUserQuery().data;
    const task = useSuspenseTask(taskId).data;
    const updateTask = useUpdateTask(projectId, taskId);

    const canUpdateStatus = canChangeTaskStatus(currentUser, task);

    function handleTaskStatusChange(status: TaskStatus) {
        updateTask.mutate({ status });
    }

    return (
        <article className="grid gap-5">
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
