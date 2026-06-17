import type { ProjectListQuery, ProjectStatus } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import type { Page } from "@/infra/domain/page";
import { PgTypedTransactionalAdapter } from "@/infra/database";
import {
    countProjects,
    getProjectById,
    listProjects
} from "@/features/operations/database/__generated__/operations.queries";
import type { ProjectSnapshot } from "@/features/operations/domain";

/**
 * project list page와 detail snapshot을 PgTyped query로 읽는다.
 *
 * operations query service가 project response를 구성할 때 사용한다.
 * generated row의 status와 aggregate count는 repository boundary에서 domain snapshot으로 매핑한다.
 */
@Injectable()
export class ProjectReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async list(query: ProjectListQuery): Promise<Page<ProjectSnapshot>> {
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
            items: projects.map(toProjectSnapshot),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    async findById(projectId: number): Promise<ProjectSnapshot | null> {
        const project = await this.db.query(getProjectById, { projectId }).singleOrNull();

        return project ? toProjectSnapshot(project) : null;
    }
}

function toProjectSnapshot(project: {
    id: number;
    name: string;
    description: string;
    status: string;
    ownerId: number;
    ownerName: string;
    createdById: number;
    createdByName: string;
    taskCount: number | null;
    openTaskCount: number | null;
    pendingRequestCount: number | null;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status as ProjectStatus,
        ownerId: project.ownerId,
        ownerName: project.ownerName,
        createdById: project.createdById,
        createdByName: project.createdByName,
        taskCount: project.taskCount ?? 0,
        openTaskCount: project.openTaskCount ?? 0,
        pendingRequestCount: project.pendingRequestCount ?? 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
    };
}
