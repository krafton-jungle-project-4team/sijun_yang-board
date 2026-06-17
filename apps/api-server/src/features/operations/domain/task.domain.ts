import type { TaskPriority, TaskStatus, TaskSummary, UpdateTaskInput } from "@nmm/shared";

import type { AuthClaims } from "@/features/auth";

export interface TaskSnapshot {
    id: number;
    projectId: number;
    projectName: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId: number | null;
    assigneeName: string | null;
    createdById: number;
    createdByName: string;
    createdAt: Date;
    updatedAt: Date;
}

export const TaskDomain = {
    toTask(task: TaskSnapshot): TaskSummary {
        return {
            id: task.id,
            projectId: task.projectId,
            projectName: task.projectName,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId,
            assigneeName: task.assigneeName,
            createdById: task.createdById,
            createdByName: task.createdByName,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString()
        };
    },
    hasAdminFieldPatch(input: UpdateTaskInput) {
        return (
            input.title !== undefined ||
            input.description !== undefined ||
            input.priority !== undefined ||
            input.assigneeId !== undefined
        );
    },
    canUpdate(task: TaskMutationTarget, auth: AuthClaims, input: UpdateTaskInput) {
        const adminFieldPatch = TaskDomain.hasAdminFieldPatch(input);

        return (
            auth.role === "ADMIN" || (task.assigneeId === auth.userId && input.status !== undefined && !adminFieldPatch)
        );
    }
};

export interface TaskMutationTarget {
    id: number;
    assigneeId: number | null;
}

export interface TaskMutationResult {
    task: TaskMutationTarget;
    changedId: number | null;
}
