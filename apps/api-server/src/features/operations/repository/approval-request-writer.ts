import type { ApprovalRequestStatus, CreateApprovalRequestInput, ReviewApprovalRequestInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { createApprovalRequest, reviewApprovalRequest } from "../database/__generated__/operations.queries";
import type { ApprovalRequestReviewResult } from "../domain";

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
