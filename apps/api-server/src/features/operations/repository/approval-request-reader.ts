import type { ApprovalRequestDetail, ApprovalRequestListQuery, ApprovalRequestSummary } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import type { Page } from "@/infra/domain/page";
import { PgTypedTransactionalAdapter } from "@/infra/database";
import {
    countApprovalRequests,
    getApprovalRequestById,
    listApprovalRequests
} from "@/features/operations/database/__generated__/operations.queries";
import { toApprovalRequestSummary } from "./read-model-mappers";

/**
 * approval request list page와 detail response를 PgTyped query로 읽는다.
 *
 * operations query service가 approval request response를 구성할 때 사용한다.
 * nullable reviewer 정보와 status 문자열은 repository boundary에서 shared contract로 정리한다.
 */
@Injectable()
export class ApprovalRequestReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async list(query: ApprovalRequestListQuery): Promise<Page<ApprovalRequestSummary>> {
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
            items: requests.map(toApprovalRequestSummary),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    async findById(requestId: number): Promise<ApprovalRequestDetail | null> {
        const request = await this.db.query(getApprovalRequestById, { requestId }).singleOrNull();

        return request ? toApprovalRequestSummary(request) : null;
    }
}
