import type { TaskDetail, TaskSummary } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { getTaskById, listTasksByProjectId } from "@/features/operations/database/__generated__/operations.queries";
import { toTaskSummary } from "./read-model-mappers";

/**
 * task list와 detail response를 PgTyped query로 읽는다.
 *
 * project detail 흐름과 task detail route가 task response를 만들 때 사용한다.
 * generated row의 enum 문자열은 반환 전에 shared contract로 정리한다.
 */
@Injectable()
export class TaskReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async listByProjectId(projectId: number): Promise<TaskSummary[]> {
        const tasks = await this.db.query(listTasksByProjectId, { projectId }).multiple();

        return tasks.map(toTaskSummary);
    }

    async findById(taskId: number): Promise<TaskDetail | null> {
        const task = await this.db.query(getTaskById, { taskId }).singleOrNull();

        return task ? toTaskSummary(task) : null;
    }
}
