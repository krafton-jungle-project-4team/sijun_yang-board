import type { CreateProjectInput } from "@nmm/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate } from "@tanstack/react-router";

import { useCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { useCreateProject } from "../../features/projects/hooks/use-projects";
import { canManageProjects } from "../../features/projects/model/project-permissions";
import { ProjectForm } from "../../features/projects/ui/project-form";
import { useUsers } from "../../features/users/hooks/use-users";

export function NewProjectPage() {
    const navigate = useNavigate();
    const currentUserQuery = useCurrentUserQuery();
    const usersQuery = useUsers();
    const createProject = useCreateProject();

    async function handleSubmit(input: CreateProjectInput) {
        const result = await createProject.mutateAsync(input);

        await navigate({ to: "/projects/$projectId", params: { projectId: String(result.id) } });
    }

    function handleCancel() {
        void navigate({ to: "/projects" });
    }

    if (currentUserQuery.isPending || usersQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Loading project form...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!canManageProjects(currentUserQuery.data)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project creation unavailable</CardTitle>
                    <CardDescription>Only admins can create projects.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-5">
            <CardHeader className="px-0">
                <CardTitle>New project</CardTitle>
            </CardHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Project details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectForm
                        users={usersQuery.data ?? []}
                        pending={createProject.isPending}
                        submitLabel="Create"
                        onCancel={handleCancel}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
