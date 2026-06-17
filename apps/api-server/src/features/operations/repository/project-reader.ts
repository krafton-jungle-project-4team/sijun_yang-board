import type { ProjectDetail, ProjectListQuery, ProjectSummary } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import type { Page } from "@/infra/domain/page";
import { PgTypedTransactionalAdapter } from "@/infra/database";
import {
    countProjects,
    getProjectById,
    listProjects
} from "@/features/operations/database/__generated__/operations.queries";
import { toProjectSummary } from "./read-model-mappers";

/**
 * project list page와 detail response를 PgTyped query로 읽는다.
 *
 * operations query service가 project response를 구성할 때 사용한다.
 * generated row의 status와 aggregate count는 repository boundary에서 shared contract로 매핑한다.
 */
@Injectable()
export class ProjectReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async list(query: ProjectListQuery): Promise<Page<ProjectSummary>> {
        const filters = {
            search: query.search ?? null,
            status: query.status === "ALL" ? null : query.status
        };
        const projects = await this.db
            .query(listProjects, {
                ...filters,
                sort: query.sort,
                limit: query.pageSize,
                offset: (query.page - 1) * query.pageSize
            })
            .multiple();
        const total = await this.db.query(countProjects, filters).single();

        return {
            items: projects.map(toProjectSummary),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    async findById(projectId: number): Promise<ProjectDetail | null> {
        const project = await this.db.query(getProjectById, { projectId }).singleOrNull();

        return project ? toProjectSummary(project) : null;
    }
}
