import type { ApprovalRequestStatus } from "@nmm/shared";

export const approvalRequestStatusLabels: Record<ApprovalRequestStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected"
};
