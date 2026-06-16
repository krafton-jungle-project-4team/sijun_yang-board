import type { ApprovalRequestListQuery, ApprovalRequestStatus } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import type { Page } from "../../../infra/domain/page";
import { PgTypedTransactionalAdapter } from "../../../infra/database";
import {
    countApprovalRequests,
    getApprovalRequestById,
    listApprovalRequests
} from "../database/__generated__/operations.queries";
import type { ApprovalRequestSnapshot } from "../domain";

@Injectable()
export class ApprovalRequestReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async list(query: ApprovalRequestListQuery): Promise<Page<ApprovalRequestSnapshot>> {
        const filters = {
            projectId: query.projectId ?? null,
            search: query.search ?? null,
            status: query.status === "ALL" ? null : query.status
        };
        const requests = await this.db
            .query(listApprovalRequests, {
                ...filters,
                sort: query.sort,
                limit: query.pageSize,
                offset: (query.page - 1) * query.pageSize
            })
            .multiple();
        const total = await this.db.query(countApprovalRequests, filters).single();

        return {
            items: requests.map(toApprovalRequestSnapshot),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    async findById(requestId: number): Promise<ApprovalRequestSnapshot | null> {
        const request = await this.db.query(getApprovalRequestById, { requestId }).singleOrNull();

        return request ? toApprovalRequestSnapshot(request) : null;
    }
}

export function toApprovalRequestSnapshot(request: {
    id: number;
    projectId: number;
    projectName: string;
    title: string;
    description: string;
    status: string;
    requesterId: number;
    requesterName: string;
    reviewerId: number | null;
    reviewerName: string | null;
    reviewedAt: Date | null;
    reviewComment: string | null;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        id: request.id,
        projectId: request.projectId,
        projectName: request.projectName,
        title: request.title,
        description: request.description,
        status: request.status as ApprovalRequestStatus,
        requesterId: request.requesterId,
        requesterName: request.requesterName,
        reviewerId: request.reviewerId,
        reviewerName: request.reviewerName ?? null,
        reviewedAt: request.reviewedAt,
        reviewComment: request.reviewComment,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
    };
}
