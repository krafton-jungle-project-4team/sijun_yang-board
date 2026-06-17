import type { TaskSummary, User } from "@nmm/shared";

import { isSignedInUser } from "@/features/auth/model/current-user";

export function canManageProjects(user: User | null | undefined) {
    return isSignedInUser(user) && user.role === "ADMIN";
}

export function canChangeTaskStatus(user: User | null | undefined, task: Pick<TaskSummary, "assigneeId">) {
    return isSignedInUser(user) && (user.role === "ADMIN" || user.id === task.assigneeId);
}
