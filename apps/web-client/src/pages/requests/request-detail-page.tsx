import type { ReviewApprovalRequestInput } from "@nmm/shared";
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
import { ArrowLeft } from "lucide-react";

import { useCurrentUserQuery } from "../../features/auth/api/auth-queries";
import { useApproveRequest, useRejectRequest, useRequest } from "../../features/requests/hooks/use-requests";
import { approvalRequestStatusLabels } from "../../features/requests/model/request-labels";
import { RequestReviewForm } from "../../features/requests/ui/request-review-form";

export function RequestDetailPage() {
    const params = useParams({ strict: false }) as { requestId: string };
    const requestId = Number(params.requestId);
    const currentUser = useCurrentUserQuery().data;
    const requestQuery = useRequest(requestId);
    const approveRequest = useApproveRequest(requestId);
    const rejectRequest = useRejectRequest(requestId);
    const isReviewPending = approveRequest.isPending || rejectRequest.isPending;

    async function handleApprove(input: ReviewApprovalRequestInput) {
        await approveRequest.mutateAsync(input);
    }

    async function handleReject(input: ReviewApprovalRequestInput) {
        await rejectRequest.mutateAsync(input);
    }

    if (!Number.isInteger(requestId) || requestId <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid request.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (requestQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Loading request...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (requestQuery.isError) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Could not load request.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const request = requestQuery.data;
    const canReview = currentUser?.role === "ADMIN" && request.status === "PENDING";

    return (
        <article className="grid gap-5">
            <div>
                <Button asChild variant="ghost">
                    <Link to="/requests">
                        <ArrowLeft />
                        Requests
                    </Link>
                </Button>
            </div>
            <CardHeader className="px-0">
                <Badge variant="secondary">{approvalRequestStatusLabels[request.status]}</Badge>
                <CardTitle>{request.title}</CardTitle>
                <CardDescription>
                    {request.projectName} · requested by {request.requesterName}
                </CardDescription>
            </CardHeader>
            <Card>
                <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-7">{request.description}</p>
                </CardContent>
            </Card>
            {request.reviewedAt ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Review</CardTitle>
                        <CardDescription>
                            {request.reviewerName ?? "Reviewer"} · {new Date(request.reviewedAt).toLocaleString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-sm leading-7">
                            {request.reviewComment || "No review comment."}
                        </p>
                    </CardContent>
                </Card>
            ) : null}
            {canReview ? (
                <>
                    <Separator />
                    <Card>
                        <CardHeader>
                            <CardTitle>Decision</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RequestReviewForm
                                pending={isReviewPending}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        </CardContent>
                    </Card>
                </>
            ) : null}
        </article>
    );
}
