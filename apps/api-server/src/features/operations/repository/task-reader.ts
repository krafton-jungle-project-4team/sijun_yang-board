import type { TaskPriority, TaskStatus } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { getTaskById, listTasksByProjectId } from "@/features/operations/database/__generated__/operations.queries";
import type { TaskSnapshot } from "@/features/operations/domain";

@Injectable()
export class TaskReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async listByProjectId(projectId: number): Promise<TaskSnapshot[]> {
        const tasks = await this.db.query(listTasksByProjectId, { projectId }).multiple();

        return tasks.map(toTaskSnapshot);
    }

    async findById(taskId: number): Promise<TaskSnapshot | null> {
        const task = await this.db.query(getTaskById, { taskId }).singleOrNull();

        return task ? toTaskSnapshot(task) : null;
    }
}

export function toTaskSnapshot(task: {
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
}) {
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
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
    };
}
