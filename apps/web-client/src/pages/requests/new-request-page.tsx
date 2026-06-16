import type { CreateApprovalRequestInput } from "@nmm/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate } from "@tanstack/react-router";

import { useProjects } from "../../features/projects/hooks/use-projects";
import { toProjectListQuery } from "../../features/projects/model/project-search";
import { useCreateRequest } from "../../features/requests/hooks/use-requests";
import { RequestForm } from "../../features/requests/ui/request-form";

export function NewRequestPage() {
    const navigate = useNavigate();
    const projectsQuery = useProjects(
        toProjectListQuery({
            page: 1,
            search: "",
            sort: "name",
            status: "ALL"
        })
    );
    const createRequest = useCreateRequest();
    const projects = projectsQuery.data?.items ?? [];

    async function handleSubmit(input: CreateApprovalRequestInput) {
        const result = await createRequest.mutateAsync(input);

        await navigate({ to: "/requests/$requestId", params: { requestId: String(result.id) } });
    }

    function handleCancel() {
        void navigate({ to: "/requests" });
    }

    if (projectsQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Loading request form...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-5">
            <CardHeader className="px-0">
                <CardTitle>New request</CardTitle>
            </CardHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Approval details</CardTitle>
                </CardHeader>
                <CardContent>
                    <RequestForm
                        projects={projects}
                        pending={createRequest.isPending}
                        onCancel={handleCancel}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
