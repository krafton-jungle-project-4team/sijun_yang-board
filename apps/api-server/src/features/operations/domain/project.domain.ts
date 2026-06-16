import type { ProjectStatus, ProjectSummary } from "@nmm/shared";

export interface ProjectSnapshot {
    id: number;
    name: string;
    description: string;
    status: ProjectStatus;
    ownerId: number;
    ownerName: string;
    createdById: number;
    createdByName: string;
    taskCount: number;
    openTaskCount: number;
    pendingRequestCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export const ProjectDomain = {
    toProject(project: ProjectSnapshot): ProjectSummary {
        return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            ownerId: project.ownerId,
            ownerName: project.ownerName,
            createdById: project.createdById,
            createdByName: project.createdByName,
            taskCount: project.taskCount,
            openTaskCount: project.openTaskCount,
            pendingRequestCount: project.pendingRequestCount,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString()
        };
    }
};
