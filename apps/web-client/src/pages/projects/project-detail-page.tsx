import type { CreateTaskInput } from "@nmm/shared";
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
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";

import { useCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { useCreateTask, useProject, useProjectTasks } from "../../features/projects/hooks/use-projects";
import { projectStatusLabels } from "../../features/projects/model/project-labels";
import { canManageProjects } from "../../features/projects/model/project-permissions";
import { ProjectTasksTable } from "../../features/projects/ui/project-tasks-table";
import { TaskForm } from "../../features/projects/ui/task-form";
import { useUsers } from "../../features/users/hooks/use-users";

export function ProjectDetailPage() {
    const params = useParams({ strict: false }) as { projectId: string };
    const projectId = Number(params.projectId);
    const currentUser = useCurrentUserQuery().data;
    const usersQuery = useUsers();
    const projectQuery = useProject(projectId);
    const tasksQuery = useProjectTasks(projectId);
    const createTask = useCreateTask(projectId);
    const canManageProject = canManageProjects(currentUser);

    async function handleTaskSubmit(input: CreateTaskInput) {
        await createTask.mutateAsync(input);
    }

    if (!Number.isInteger(projectId) || projectId <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid project.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (projectQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Loading project...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (projectQuery.isError) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Could not load project.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const project = projectQuery.data;
    const tasks = tasksQuery.data ?? [];

    return (
        <article className="grid gap-5">
            <div className="flex items-center justify-between gap-3">
                <Button asChild variant="ghost">
                    <Link to="/projects">
                        <ArrowLeft />
                        Projects
                    </Link>
                </Button>
                {canManageProject ? (
                    <Button asChild variant="outline">
                        <Link to="/projects/$projectId/edit" params={{ projectId: String(project.id) }}>
                            <Pencil />
                            Edit
                        </Link>
                    </Button>
                ) : null}
            </div>

            <CardHeader className="px-0">
                <Badge variant="secondary">{projectStatusLabels[project.status]}</Badge>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                    {project.ownerName} owns this project · {project.openTaskCount} open tasks ·{" "}
                    {project.pendingRequestCount} pending approvals
                </CardDescription>
            </CardHeader>

            <Card>
                <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-7">{project.description}</p>
                </CardContent>
            </Card>

            <Separator />
            <CardHeader className="px-0">
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Optimistic status updates.</CardDescription>
            </CardHeader>
            {tasksQuery.isPending ? (
                <Card>
                    <CardHeader>
                        <CardDescription>Loading tasks...</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <ProjectTasksTable currentUser={currentUser} projectId={project.id} tasks={tasks} />
            )}

            {canManageProject ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Assign task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TaskForm
                            users={usersQuery.data ?? []}
                            pending={createTask.isPending}
                            onSubmit={handleTaskSubmit}
                        />
                    </CardContent>
                </Card>
            ) : null}
        </article>
    );
}
