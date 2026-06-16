import type {
    ApprovalRequestSummary,
    ApprovalRequestStatus,
    Dashboard,
    PostSummary,
    ProjectStatus,
    ProjectSummary,
    TaskPriority,
    TaskStatus,
    TaskSummary,
    UserOption
} from "@nmm/shared";

import type {
    IGetApprovalRequestByIdResult,
    IGetProjectByIdResult,
    IGetTaskByIdResult,
    IListActiveUsersResult,
    IListApprovalRequestsResult,
    IListDashboardMyTasksResult,
    IListDashboardPendingRequestsResult,
    IListDashboardRecentPostsResult,
    IListProjectsResult,
    IListTasksByProjectIdResult
} from "../database/__generated__/operations.queries";

type ProjectRow = IListProjectsResult | IGetProjectByIdResult;
type TaskRow = IListTasksByProjectIdResult | IGetTaskByIdResult | IListDashboardMyTasksResult;
type ApprovalRequestRow =
    | IListApprovalRequestsResult
    | IGetApprovalRequestByIdResult
    | IListDashboardPendingRequestsResult;

export function toUserOption(user: IListActiveUsersResult): UserOption {
    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role as UserOption["role"]
    };
}

export function toProjectSummary(project: ProjectRow): ProjectSummary {
    return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status as ProjectStatus,
        ownerId: project.ownerId,
        ownerName: project.ownerName,
        createdById: project.createdById,
        createdByName: project.createdByName,
        taskCount: project.taskCount ?? 0,
        openTaskCount: project.openTaskCount ?? 0,
        pendingRequestCount: project.pendingRequestCount ?? 0,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
    };
}

export function toTaskSummary(task: TaskRow): TaskSummary {
    return {
        id: task.id,
        projectId: task.projectId,
        projectName: task.projectName,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        assigneeId: task.assigneeId,
        assigneeName: task.assigneeName ?? null,
        createdById: task.createdById,
        createdByName: task.createdByName,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
    };
}

export function toApprovalRequestSummary(request: ApprovalRequestRow): ApprovalRequestSummary {
    return {
        id: request.id,
        projectId: request.projectId,
        projectName: request.projectName,
        title: request.title,
        description: request.description,
        status: request.status as ApprovalRequestStatus,
        requesterId: request.requesterId,
        requesterName: request.requesterName,
        reviewerId: request.reviewerId,
        reviewerName: request.reviewerName ?? null,
        reviewedAt: toIsoStringOrNull(request.reviewedAt),
        reviewComment: request.reviewComment,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString()
    };
}

export function toDashboardSummary(
    counts: { activeProjectCount: number | null; inProgressTaskCount: number | null },
    myTasks: IListDashboardMyTasksResult[],
    pendingRequests: IListDashboardPendingRequestsResult[],
    recentAnnouncements: IListDashboardRecentPostsResult[]
): Dashboard {
    return {
        activeProjectCount: counts.activeProjectCount ?? 0,
        inProgressTaskCount: counts.inProgressTaskCount ?? 0,
        myTasks: myTasks.map(toTaskSummary),
        pendingRequests: pendingRequests.map(toApprovalRequestSummary),
        recentAnnouncements: recentAnnouncements.map(toPostSummary)
    };
}

function toPostSummary(post: IListDashboardRecentPostsResult): PostSummary {
    const excerpt = post.content.length > 160 ? `${post.content.slice(0, 157)}...` : post.content;

    return {
        id: post.id,
        title: post.title,
        excerpt,
        authorId: post.authorId,
        authorName: post.authorName,
        commentCount: post.commentCount ?? 0,
        viewCount: post.viewCount,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
    };
}

function toIsoStringOrNull(date: Date | null) {
    return date ? date.toISOString() : null;
}
