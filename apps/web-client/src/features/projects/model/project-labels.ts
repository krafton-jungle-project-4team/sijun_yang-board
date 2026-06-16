import type { ProjectStatus, TaskPriority, TaskStatus } from "@nmm/shared";

export const projectStatusLabels: Record<ProjectStatus, string> = {
    PLANNED: "Planned",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    ARCHIVED: "Archived"
};

export const taskStatusLabels: Record<TaskStatus, string> = {
    TODO: "To do",
    IN_PROGRESS: "In progress",
    DONE: "Done"
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High"
};
