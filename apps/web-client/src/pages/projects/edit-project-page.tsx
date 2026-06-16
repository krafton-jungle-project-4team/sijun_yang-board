import type { CreateProjectInput } from "@nmm/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate, useParams } from "@tanstack/react-router";

import { useCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { useProject, useUpdateProject } from "../../features/projects/hooks/use-projects";
import { canManageProjects } from "../../features/projects/model/project-permissions";
import { ProjectForm } from "../../features/projects/ui/project-form";
import { useUsers } from "../../features/users/hooks/use-users";

export function EditProjectPage() {
    const navigate = useNavigate();
    const params = useParams({ strict: false }) as { projectId: string };
    const projectId = Number(params.projectId);
    const currentUserQuery = useCurrentUserQuery();
    const usersQuery = useUsers();
    const projectQuery = useProject(projectId);
    const updateProject = useUpdateProject(projectId);

    async function handleSubmit(input: CreateProjectInput) {
        await updateProject.mutateAsync(input);
        await navigate({ to: "/projects/$projectId", params: { projectId: String(projectId) } });
    }

    function handleCancel() {
        void navigate({ to: "/projects/$projectId", params: { projectId: String(projectId) } });
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

    if (currentUserQuery.isPending || usersQuery.isPending || projectQuery.isPending) {
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

    if (!canManageProjects(currentUserQuery.data)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project editing unavailable</CardTitle>
                    <CardDescription>Only admins can edit projects.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-5">
            <CardHeader className="px-0">
                <CardTitle>Edit project</CardTitle>
            </CardHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Project details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectForm
                        users={usersQuery.data ?? []}
                        initialValue={{
                            name: projectQuery.data.name,
                            description: projectQuery.data.description,
                            status: projectQuery.data.status,
                            ownerId: projectQuery.data.ownerId
                        }}
                        pending={updateProject.isPending}
                        submitLabel="Save"
                        onCancel={handleCancel}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
