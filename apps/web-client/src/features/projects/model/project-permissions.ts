import type { TaskSummary, User } from "@nmm/shared";

import { isActiveUser } from "../../auth/model/user-status";

export function canManageProjects(user: User | null | undefined) {
    return isActiveUser(user) && user.role === "ADMIN";
}

export function canChangeTaskStatus(user: User | null | undefined, task: Pick<TaskSummary, "assigneeId">) {
    return isActiveUser(user) && (user.role === "ADMIN" || user.id === task.assigneeId);
}
