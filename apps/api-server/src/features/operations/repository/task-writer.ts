import type { CreateTaskInput, UpdateTaskInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import type { AuthClaims } from "@/features/auth";
import { createTask, updateTask } from "@/features/operations/database/__generated__/operations.queries";
import { TaskDomain, type TaskMutationResult } from "@/features/operations/domain";

/**
 * task record를 만들고 수정 결과를 service policy check용 summary로 반환한다.
 *
 * admin의 task 생성과 admin 또는 담당자의 task 수정 흐름에서 사용한다.
 * admin-only field patch 여부는 domain helper로 계산하고 SQL에는 필요한 mutation context만 넘긴다.
 */
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
