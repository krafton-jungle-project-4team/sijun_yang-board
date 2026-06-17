import type { CreateProjectInput, UpdateProjectInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { createProject, updateProject } from "@/features/operations/database/__generated__/operations.queries";

@Injectable()
export class ProjectWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async create(createdById: number, input: CreateProjectInput): Promise<number> {
        const project = await this.db
            .query(createProject, {
                name: input.name,
                description: input.description,
                status: input.status,
                ownerId: input.ownerId ?? null,
                createdById
            })
            .single();

        return project.id;
    }

    async update(projectId: number, input: UpdateProjectInput): Promise<number | null> {
        const project = await this.db
            .query(updateProject, {
                projectId,
                name: input.name ?? null,
                description: input.description ?? null,
                status: input.status ?? null,
                ownerId: input.ownerId ?? null
            })
            .singleOrNull();

        return project?.id ?? null;
    }
}
