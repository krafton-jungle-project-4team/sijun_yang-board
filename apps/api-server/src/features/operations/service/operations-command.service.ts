import type {
    ApprovalRequestStatus,
    CreateApprovalRequestInput,
    CreateProjectInput,
    CreateTaskInput,
    IdCommandResult,
    ReviewApprovalRequestInput,
    UpdateProjectInput,
    UpdateTaskInput
} from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import type { AuthClaims } from "@/features/auth";
import { ApprovalRequestDomain, TaskDomain } from "@/features/operations/domain";
import {
    adminRequiredError,
    approvalRequestAlreadyReviewedError,
    approvalRequestNotFoundError,
    projectNotFoundError,
    taskMutationForbiddenError,
    taskNotFoundError
} from "@/features/operations/operations-errors";
import { ApprovalRequestWriter, ProjectWriter, TaskWriter } from "@/features/operations/repository";

@Injectable()
export class OperationsCommandService {
    constructor(
        private readonly projectWriter: ProjectWriter,
        private readonly taskWriter: TaskWriter,
        private readonly approvalRequestWriter: ApprovalRequestWriter
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async createProject(auth: AuthClaims, input: CreateProjectInput): Promise<IdCommandResult> {
        assertAdmin(auth);
        const id = await this.projectWriter.create(auth.userId, input);

        return { id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updateProject(auth: AuthClaims, projectId: number, input: UpdateProjectInput): Promise<IdCommandResult> {
        assertAdmin(auth);
        const id = await this.projectWriter.update(projectId, input);

        if (!id) {
            throw projectNotFoundError();
        }

        return { id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createTask(auth: AuthClaims, projectId: number, input: CreateTaskInput): Promise<IdCommandResult> {
        assertAdmin(auth);
        const task = await this.taskWriter.create(auth.userId, projectId, input);

        if (!task) {
            throw projectNotFoundError();
        }

        return { id: task.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updateTask(auth: AuthClaims, taskId: number, input: UpdateTaskInput): Promise<IdCommandResult> {
        const result = await this.taskWriter.update(auth, taskId, input);

        if (!result) {
            throw taskNotFoundError();
        }

        if (!TaskDomain.canUpdate(result.task, auth, input) || !result.changedId) {
            throw taskMutationForbiddenError();
        }

        return { id: result.changedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createApprovalRequest(auth: AuthClaims, input: CreateApprovalRequestInput): Promise<IdCommandResult> {
        const request = await this.approvalRequestWriter.create(auth.userId, input);

        if (!request) {
            throw projectNotFoundError();
        }

        return { id: request.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async approveRequest(
        auth: AuthClaims,
        requestId: number,
        input: ReviewApprovalRequestInput
    ): Promise<IdCommandResult> {
        return this.reviewRequest(auth, requestId, "APPROVED", input);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async rejectRequest(
        auth: AuthClaims,
        requestId: number,
        input: ReviewApprovalRequestInput
    ): Promise<IdCommandResult> {
        return this.reviewRequest(auth, requestId, "REJECTED", input);
    }

    private async reviewRequest(
        auth: AuthClaims,
        requestId: number,
        nextStatus: ApprovalRequestStatus,
        input: ReviewApprovalRequestInput
    ): Promise<IdCommandResult> {
        assertAdmin(auth);
        const result = await this.approvalRequestWriter.review({
            requestId,
            nextStatus,
            reviewerId: auth.userId,
            input
        });

        if (!result) {
            throw approvalRequestNotFoundError();
        }

        if (ApprovalRequestDomain.isReviewed(result.request) || !result.changedId) {
            throw approvalRequestAlreadyReviewedError();
        }

        return { id: result.changedId };
    }
}

function assertAdmin(auth: AuthClaims) {
    if (auth.role !== "ADMIN") {
        throw adminRequiredError();
    }
}
