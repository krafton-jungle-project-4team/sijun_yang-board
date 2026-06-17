import { z } from "zod";

import { createPageResultSchema } from "./api.contract";
import { postSummarySchema } from "./post.contract";

export const projectStatusSchema = z.enum(["PLANNED", "ACTIVE", "COMPLETED", "ARCHIVED"]);
export const projectStatusFilterSchema = z.enum(["ALL", ...projectStatusSchema.options]).default("ALL");
export const projectSortSchema = z.enum(["latest", "oldest", "name"]).default("latest");

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const approvalRequestStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const approvalRequestStatusFilterSchema = z.enum(["ALL", ...approvalRequestStatusSchema.options]).default("ALL");
export const approvalRequestSortSchema = z.enum(["latest", "oldest"]).default("latest");

export const userOptionSchema = z.object({
    id: z.number().int().positive(),
    email: z.string().email(),
    displayName: z.string().min(1).max(80),
    role: z.enum(["USER", "ADMIN"])
});

export const projectListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
    search: z.string().trim().min(1).max(120).optional(),
    sort: projectSortSchema,
    status: projectStatusFilterSchema
});

export const projectSummarySchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(120),
    description: z.string(),
    status: projectStatusSchema,
    ownerId: z.number().int().positive(),
    ownerName: z.string().min(1),
    createdById: z.number().int().positive(),
    createdByName: z.string().min(1),
    taskCount: z.number().int().nonnegative(),
    openTaskCount: z.number().int().nonnegative(),
    pendingRequestCount: z.number().int().nonnegative(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

export const projectDetailSchema = projectSummarySchema;

export const projectListResultSchema = createPageResultSchema(projectSummarySchema);

export const createProjectInputSchema = z.object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(5000),
    status: projectStatusSchema.default("PLANNED"),
    ownerId: z.number().int().positive().optional()
});

export const updateProjectInputSchema = createProjectInputSchema
    .partial()
    .refine(
        (value) =>
            value.name !== undefined ||
            value.description !== undefined ||
            value.status !== undefined ||
            value.ownerId !== undefined,
        "At least one project field is required."
    );

export const taskSummarySchema = z.object({
    id: z.number().int().positive(),
    projectId: z.number().int().positive(),
    projectName: z.string().min(1),
    title: z.string().min(1).max(120),
    description: z.string(),
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    assigneeId: z.number().int().positive().nullable(),
    assigneeName: z.string().min(1).nullable(),
    createdById: z.number().int().positive(),
    createdByName: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

export const taskDetailSchema = taskSummarySchema;

export const createTaskInputSchema = z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(5000),
    status: taskStatusSchema.default("TODO"),
    priority: taskPrioritySchema.default("MEDIUM"),
    assigneeId: z.number().int().positive().optional()
});

export const updateTaskInputSchema = z
    .object({
        title: z.string().trim().min(1).max(120).optional(),
        description: z.string().trim().min(1).max(5000).optional(),
        status: taskStatusSchema.optional(),
        priority: taskPrioritySchema.optional(),
        assigneeId: z.number().int().positive().nullable().optional()
    })
    .refine(
        (value) =>
            value.title !== undefined ||
            value.description !== undefined ||
            value.status !== undefined ||
            value.priority !== undefined ||
            value.assigneeId !== undefined,
        "At least one task field is required."
    );

export const approvalRequestListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
    projectId: z.coerce.number().int().positive().optional(),
    search: z.string().trim().min(1).max(120).optional(),
    sort: approvalRequestSortSchema,
    status: approvalRequestStatusFilterSchema
});

export const approvalRequestSummarySchema = z.object({
    id: z.number().int().positive(),
    projectId: z.number().int().positive(),
    projectName: z.string().min(1),
    title: z.string().min(1).max(120),
    description: z.string(),
    status: approvalRequestStatusSchema,
    requesterId: z.number().int().positive(),
    requesterName: z.string().min(1),
    reviewerId: z.number().int().positive().nullable(),
    reviewerName: z.string().min(1).nullable(),
    reviewedAt: z.string().datetime().nullable(),
    reviewComment: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

export const approvalRequestDetailSchema = approvalRequestSummarySchema;

export const approvalRequestListResultSchema = createPageResultSchema(approvalRequestSummarySchema);

export const createApprovalRequestInputSchema = z.object({
    projectId: z.number().int().positive(),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(5000)
});

export const reviewApprovalRequestInputSchema = z.object({
    reviewComment: z.string().trim().max(2000).optional()
});

export const dashboardSchema = z.object({
    activeProjectCount: z.number().int().nonnegative(),
    inProgressTaskCount: z.number().int().nonnegative(),
    myTasks: z.array(taskSummarySchema),
    pendingRequests: z.array(approvalRequestSummarySchema),
    recentAnnouncements: z.array(postSummarySchema)
});

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectStatusFilter = z.infer<typeof projectStatusFilterSchema>;
export type ProjectSort = z.infer<typeof projectSortSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type ApprovalRequestStatus = z.infer<typeof approvalRequestStatusSchema>;
export type ApprovalRequestStatusFilter = z.infer<typeof approvalRequestStatusFilterSchema>;
export type ApprovalRequestSort = z.infer<typeof approvalRequestSortSchema>;
export type UserOption = z.infer<typeof userOptionSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export type ProjectDetail = z.infer<typeof projectDetailSchema>;
export type ProjectListResult = z.infer<typeof projectListResultSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type TaskSummary = z.infer<typeof taskSummarySchema>;
export type TaskDetail = z.infer<typeof taskDetailSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type ApprovalRequestListQuery = z.infer<typeof approvalRequestListQuerySchema>;
export type ApprovalRequestSummary = z.infer<typeof approvalRequestSummarySchema>;
export type ApprovalRequestDetail = z.infer<typeof approvalRequestDetailSchema>;
export type ApprovalRequestListResult = z.infer<typeof approvalRequestListResultSchema>;
export type CreateApprovalRequestInput = z.infer<typeof createApprovalRequestInputSchema>;
export type ReviewApprovalRequestInput = z.infer<typeof reviewApprovalRequestInputSchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;
