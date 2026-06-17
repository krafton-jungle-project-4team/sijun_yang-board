import type { Dashboard, PostSummary } from "@nmm/shared";

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
    recentAnnouncements: DashboardAnnouncementSnapshot[];
}

export interface DashboardAnnouncementSnapshot {
    id: number;
    title: string;
    content: string;
    authorId: number;
    authorName: string;
    commentCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export const DashboardViewDomain = {
    toDashboard(dashboard: DashboardView): Dashboard {
        return {
            activeProjectCount: dashboard.counts.activeProjectCount,
            inProgressTaskCount: dashboard.counts.inProgressTaskCount,
            myTasks: dashboard.myTasks.map(TaskDomain.toTask),
            pendingRequests: dashboard.pendingRequests.map(ApprovalRequestDomain.toApprovalRequest),
            recentAnnouncements: dashboard.recentAnnouncements.map(toRecentAnnouncement)
        };
    }
};

function toRecentAnnouncement(post: DashboardAnnouncementSnapshot): PostSummary {
    return {
        id: post.id,
        title: post.title,
        excerpt: createExcerpt(post.content),
        authorId: post.authorId,
        authorName: post.authorName,
        commentCount: post.commentCount,
        viewCount: post.viewCount,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
    };
}

function createExcerpt(content: string) {
    return content.length > 160 ? `${content.slice(0, 157)}...` : content;
}
