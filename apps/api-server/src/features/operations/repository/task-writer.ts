import type { AuthClaims, CreateTaskInput, UpdateTaskInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { createTask, updateTask } from "../database/__generated__/operations.queries";
import { TaskDomain, type TaskMutationResult } from "../domain";

@Injectable()
export class TaskWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async create(createdById: number, projectId: number, input: CreateTaskInput): Promise<{ id: number } | null> {
        const task = await this.db
            .query(createTask, {
                projectId,
                title: input.title,
                description: input.description,
                status: input.status,
                priority: input.priority,
                assigneeId: input.assigneeId ?? null,
                createdById
            })
            .singleOrNull();

        return task?.taskId ? { id: task.taskId } : null;
    }

    async update(auth: AuthClaims, taskId: number, input: UpdateTaskInput): Promise<TaskMutationResult | null> {
        const adminFieldPatch = TaskDomain.hasAdminFieldPatch(input);
        const task = await this.db
            .query(updateTask, {
                taskId,
                title: input.title ?? null,
                description: input.description ?? null,
                status: input.status ?? null,
                priority: input.priority ?? null,
                assigneeId: input.assigneeId ?? null,
                replaceAssignee: input.assigneeId !== undefined,
                adminFieldPatch,
                actorId: auth.userId,
                actorRole: auth.role
            })
            .singleOrNull();

        return task
            ? {
                  task: { id: task.id, assigneeId: task.assigneeId },
                  changedId: task.updatedId
              }
            : null;
    }
}
