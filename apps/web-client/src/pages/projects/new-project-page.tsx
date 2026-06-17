import type { CreateProjectInput } from "@nmm/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate } from "@tanstack/react-router";

import { showResourceCreatedFlashbar } from "@/app/app-flashbar-store";
import { useSuspenseCurrentUserQuery } from "@/features/auth/api/auth-queries";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { canManageProjects } from "@/features/projects/model/project-permissions";
import { ProjectForm } from "@/features/projects/ui/project-form";
import { useSuspenseUsers } from "@/features/users/hooks/use-users";

export function NewProjectPage() {
    const navigate = useNavigate();
    const currentUser = useSuspenseCurrentUserQuery().data;
    const users = useSuspenseUsers().data;
    const createProject = useCreateProject();

    async function handleSubmit(input: CreateProjectInput) {
        const result = await createProject.mutateAsync(input);

        await navigate({ to: "/projects/$projectId", params: { projectId: String(result.id) } });
        showResourceCreatedFlashbar("Project");
    }

    function handleCancel() {
        void navigate({ to: "/projects" });
    }

    if (!canManageProjects(currentUser)) {
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
                        users={users}
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
