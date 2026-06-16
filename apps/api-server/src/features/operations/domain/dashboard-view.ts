import type { Dashboard } from "@nmm/shared";

import { PostDomain, type PostSnapshot } from "../../board/domain";
import { ApprovalRequestDomain, type ApprovalRequestSnapshot } from "./approval-request.domain";
import { TaskDomain, type TaskSnapshot } from "./task.domain";

export interface DashboardCounts {
    activeProjectCount: number;
    inProgressTaskCount: number;
}

export interface DashboardView {
    counts: DashboardCounts;
    myTasks: TaskSnapshot[];
    pendingRequests: ApprovalRequestSnapshot[];
    recentAnnouncements: PostSnapshot[];
}

export const DashboardViewDomain = {
    toDashboard(dashboard: DashboardView): Dashboard {
        return {
            activeProjectCount: dashboard.counts.activeProjectCount,
            inProgressTaskCount: dashboard.counts.inProgressTaskCount,
            myTasks: dashboard.myTasks.map(TaskDomain.toTask),
            pendingRequests: dashboard.pendingRequests.map(ApprovalRequestDomain.toApprovalRequest),
            recentAnnouncements: dashboard.recentAnnouncements.map(PostDomain.toSummary)
        };
    }
};
