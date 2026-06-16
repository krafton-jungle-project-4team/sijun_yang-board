import type { TaskStatus, TaskSummary, User } from "@nmm/shared";
import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";

import { useUpdateTask } from "../hooks/use-projects";
import { taskPriorityLabels, taskStatusLabels } from "../model/project-labels";
import { canChangeTaskStatus } from "../model/project-permissions";
import { TaskStatusControl } from "./task-status-control";

type ProjectTasksTableProps = {
    currentUser: User | null | undefined;
    projectId: number;
    tasks: TaskSummary[];
};

export function ProjectTasksTable({ currentUser, projectId, tasks }: ProjectTasksTableProps) {
    if (tasks.length === 0) {
        return (
            <Card>
                <CardContent>
                    <CardDescription>No tasks yet.</CardDescription>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="gap-0 py-0">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead className="hidden md:table-cell">Assignee</TableHead>
                            <TableHead className="hidden lg:table-cell">Priority</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <ProjectTaskRow key={task.id} currentUser={currentUser} projectId={projectId} task={task} />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

type ProjectTaskRowProps = {
    currentUser: User | null | undefined;
    projectId: number;
    task: TaskSummary;
};

function ProjectTaskRow({ currentUser, projectId, task }: ProjectTaskRowProps) {
    const updateTask = useUpdateTask(projectId, task.id);
    const canUpdateStatus = canChangeTaskStatus(currentUser, task);

    function handleTaskStatusChange(status: TaskStatus) {
        updateTask.mutate({ status });
    }

    return (
        <TableRow>
            <TableCell>
                <div className="grid gap-1">
                    <Link
                        to="/projects/$projectId/tasks/$taskId"
                        params={{ projectId: String(projectId), taskId: String(task.id) }}
                    >
                        {task.title}
                    </Link>
                    <CardDescription className="line-clamp-1">{task.description}</CardDescription>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{task.assigneeName ?? "Unassigned"}</TableCell>
            <TableCell className="hidden lg:table-cell">
                <Badge variant="outline">{taskPriorityLabels[task.priority]}</Badge>
            </TableCell>
            <TableCell>
                {canUpdateStatus ? (
                    <TaskStatusControl
                        disabled={updateTask.isPending}
                        status={task.status}
                        onChange={handleTaskStatusChange}
                    />
                ) : (
                    <Badge variant="secondary">{taskStatusLabels[task.status]}</Badge>
                )}
            </TableCell>
        </TableRow>
    );
}
