import type { ReviewApprovalRequestInput } from "@nmm/shared";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from "@nmm/ui/components";
import { useParams } from "@tanstack/react-router";

import { useSuspenseCurrentUserQuery } from "@/features/auth/api/auth-queries";
import { useApproveRequest, useRejectRequest, useSuspenseRequest } from "@/features/requests/hooks/use-requests";
import { approvalRequestStatusLabels } from "@/features/requests/model/request-labels";
import { RequestReviewForm } from "@/features/requests/ui/request-review-form";

export function RequestDetailPage() {
    const params = useParams({ strict: false }) as { requestId: string };
    const requestId = Number(params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Invalid request.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return <RequestDetailContent requestId={requestId} />;
}

function RequestDetailContent({ requestId }: { requestId: number }) {
    const currentUser = useSuspenseCurrentUserQuery().data;
    const request = useSuspenseRequest(requestId).data;
    const approveRequest = useApproveRequest(requestId);
    const rejectRequest = useRejectRequest(requestId);
    const isReviewPending = approveRequest.isPending || rejectRequest.isPending;

    const canReview = currentUser?.role === "ADMIN" && request.status === "PENDING";

    async function handleApprove(input: ReviewApprovalRequestInput) {
        await approveRequest.mutateAsync(input);
    }

    async function handleReject(input: ReviewApprovalRequestInput) {
        await rejectRequest.mutateAsync(input);
    }

    return (
        <article className="grid gap-5">
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
