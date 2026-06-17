import type { ApprovalRequestStatus, ApprovalRequestSummary } from "@nmm/shared";

export interface ApprovalRequestSnapshot {
    id: number;
    projectId: number;
    projectName: string;
    title: string;
    description: string;
    status: ApprovalRequestStatus;
    requesterId: number;
    requesterName: string;
    reviewerId: number | null;
    reviewerName: string | null;
    reviewedAt: Date | null;
    reviewComment: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export const ApprovalRequestDomain = {
    isReviewed(request: Pick<ApprovalRequestSnapshot, "status">) {
        return request.status !== "PENDING";
    },
    toApprovalRequest(request: ApprovalRequestSnapshot): ApprovalRequestSummary {
        return {
            id: request.id,
            projectId: request.projectId,
            projectName: request.projectName,
            title: request.title,
            description: request.description,
            status: request.status,
            requesterId: request.requesterId,
            requesterName: request.requesterName,
            reviewerId: request.reviewerId,
            reviewerName: request.reviewerName,
            reviewedAt: request.reviewedAt?.toISOString() ?? null,
            reviewComment: request.reviewComment,
            createdAt: request.createdAt.toISOString(),
            updatedAt: request.updatedAt.toISOString()
        };
    }
};

export interface ApprovalRequestReviewTarget {
    id: number;
    status: ApprovalRequestStatus;
}

export interface ApprovalRequestReviewResult {
    request: ApprovalRequestReviewTarget;
    changedId: number | null;
}
