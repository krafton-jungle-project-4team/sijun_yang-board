import type {
    ApprovalRequestStatus,
    ApprovalRequestSummary,
    PostSummary,
    ProjectStatus,
    ProjectSummary,
    TaskPriority,
    TaskStatus,
    TaskSummary
} from "@nmm/shared";

interface ProjectRecord {
    id: number;
    name: string;
    description: string;
    status: string;
    ownerId: number;
    ownerName: string;
    createdById: number;
    createdByName: string;
    taskCount: number | null;
    openTaskCount: number | null;
    pendingRequestCount: number | null;
    createdAt: Date;
    updatedAt: Date;
}

interface TaskRecord {
    id: number;
    projectId: number;
    projectName: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assigneeId: number | null;
    assigneeName: string | null;
    createdById: number;
    createdByName: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ApprovalRequestRecord {
    id: number;
    projectId: number;
    projectName: string;
    title: string;
    description: string;
    status: string;
    requesterId: number;
    requesterName: string;
    reviewerId: number | null;
    reviewerName: string | null;
    reviewedAt: Date | null;
    reviewComment: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface AnnouncementRecord {
    id: number;
    title: string;
    content: string;
    authorId: number;
    authorName: string;
    commentCount: number | null;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export function toProjectSummary(project: ProjectRecord): ProjectSummary {
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

export function toTaskSummary(task: TaskRecord): TaskSummary {
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

export function toApprovalRequestSummary(request: ApprovalRequestRecord): ApprovalRequestSummary {
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
        reviewedAt: request.reviewedAt?.toISOString() ?? null,
        reviewComment: request.reviewComment,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString()
    };
}

export function toAnnouncementSummary(post: AnnouncementRecord): PostSummary {
    return {
        id: post.id,
        title: post.title,
        excerpt: createExcerpt(post.content),
        authorId: post.authorId,
        authorName: post.authorName,
        commentCount: post.commentCount ?? 0,
        viewCount: post.viewCount,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
    };
}

function createExcerpt(content: string) {
    return content.length > 160 ? `${content.slice(0, 157)}...` : content;
}
