import type { ApprovalRequestStatus, CreateApprovalRequestInput, ReviewApprovalRequestInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import {
    createApprovalRequest,
    reviewApprovalRequest
} from "@/features/operations/database/__generated__/operations.queries";
import type { ApprovalRequestReviewResult } from "@/features/operations/domain";

/**
 * approval request 생성과 review 상태 변경을 PgTyped query로 실행한다.
 *
 * 사용자의 요청 생성과 admin의 approve 또는 reject command에서 사용한다.
 * 이미 검토된 요청인지 여부는 service와 domain helper가 판단할 수 있도록 이전 상태 summary를 반환한다.
 */
@Injectable()
export class ApprovalRequestWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async create(requesterId: number, input: CreateApprovalRequestInput): Promise<{ id: number } | null> {
        const request = await this.db
            .query(createApprovalRequest, {
                projectId: input.projectId,
                title: input.title,
                description: input.description,
                requesterId
            })
            .singleOrNull();

        return request?.requestId ? { id: request.requestId } : null;
    }

    async review(params: {
        requestId: number;
        nextStatus: ApprovalRequestStatus;
        reviewerId: number;
        input: ReviewApprovalRequestInput;
    }): Promise<ApprovalRequestReviewResult | null> {
        const request = await this.db
            .query(reviewApprovalRequest, {
                requestId: params.requestId,
                nextStatus: params.nextStatus,
                reviewerId: params.reviewerId,
                reviewComment: params.input.reviewComment ?? null
            })
            .singleOrNull();

        return request
            ? {
                  request: { id: request.id, status: request.status as ApprovalRequestStatus },
                  changedId: request.reviewedId
              }
            : null;
    }
}
