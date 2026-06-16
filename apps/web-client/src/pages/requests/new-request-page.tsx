import type { CreateApprovalRequestInput } from "@nmm/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@nmm/ui/components";
import { useNavigate } from "@tanstack/react-router";

import { useSuspenseProjects } from "../../features/projects/hooks/use-projects";
import { toProjectListQuery } from "../../features/projects/model/project-search";
import { useCreateRequest } from "../../features/requests/hooks/use-requests";
import { RequestForm } from "../../features/requests/ui/request-form";

export function NewRequestPage() {
    const navigate = useNavigate();
    const projects = useSuspenseProjects(
        toProjectListQuery({
            page: 1,
            search: "",
            sort: "name",
            status: "ALL"
        })
    ).data.items;
    const createRequest = useCreateRequest();

    async function handleSubmit(input: CreateApprovalRequestInput) {
        const result = await createRequest.mutateAsync(input);

        await navigate({ to: "/requests/$requestId", params: { requestId: String(result.id) } });
    }

    function handleCancel() {
        void navigate({ to: "/requests" });
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
