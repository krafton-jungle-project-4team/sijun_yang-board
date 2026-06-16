import type { CreateTaskInput, User } from "@nmm/shared";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from "@nmm/ui/components";
import { useParams } from "@tanstack/react-router";
import { Suspense } from "react";

import { SectionSkeleton } from "../../app/section-skeleton";
import { useSuspenseCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { useCreateTask, useSuspenseProject, useSuspenseProjectTasks } from "../../features/projects/hooks/use-projects";
import { projectStatusLabels } from "../../features/projects/model/project-labels";
import { canManageProjects } from "../../features/projects/model/project-permissions";
import { ProjectTasksTable } from "../../features/projects/ui/project-tasks-table";
import { TaskForm } from "../../features/projects/ui/task-form";
import { useSuspenseUsers } from "../../features/users/hooks/use-users";

export function ProjectDetailPage() {
    const params = useParams({ strict: false }) as { projectId: string };
    const projectId = Number(params.projectId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid project.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return <ProjectDetailContent projectId={projectId} />;
}

function ProjectDetailContent({ projectId }: { projectId: number }) {
    const currentUser = useSuspenseCurrentUserQuery().data;
    const project = useSuspenseProject(projectId).data;
    const canManageProject = canManageProjects(currentUser);

    return (
        <article className="grid gap-5">
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
            <Suspense fallback={<SectionSkeleton title="Tasks" description="Loading tasks..." rows={3} />}>
                <ProjectTasksSection currentUser={currentUser} projectId={project.id} />
            </Suspense>

            {canManageProject ? (
                <Suspense
                    fallback={<SectionSkeleton title="Assign task" description="Loading assignees..." rows={2} />}
                >
                    <AssignTaskCard projectId={project.id} />
                </Suspense>
            ) : null}
        </article>
    );
}

function ProjectTasksSection({ currentUser, projectId }: ProjectTasksSectionProps) {
    const tasks = useSuspenseProjectTasks(projectId).data;

    return <ProjectTasksTable currentUser={currentUser} projectId={projectId} tasks={tasks} />;
}

function AssignTaskCard({ projectId }: { projectId: number }) {
    const users = useSuspenseUsers().data;
    const createTask = useCreateTask(projectId);

    async function handleTaskSubmit(input: CreateTaskInput) {
        await createTask.mutateAsync(input);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assign task</CardTitle>
            </CardHeader>
            <CardContent>
                <TaskForm users={users} pending={createTask.isPending} onSubmit={handleTaskSubmit} />
            </CardContent>
        </Card>
    );
}

type ProjectTasksSectionProps = {
    currentUser: User | null;
    projectId: number;
};
