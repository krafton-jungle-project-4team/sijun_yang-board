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
import { operationsErrors } from "@/features/operations/operations-errors";
import { ApprovalRequestWriter, ProjectWriter, TaskWriter } from "@/features/operations/repository";

/**
 * operations feature의 write use case를 transaction 안에서 조율한다.
 *
 * project, task, approval request mutation이 권한 확인과 command result를 필요로 할 때 사용한다.
 * controller guard가 있어도 service에서 admin과 담당자 정책을 다시 확인해 우회 호출을 막는다.
 */
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
            throw operationsErrors.projectNotFound();
        }

        return { id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createTask(auth: AuthClaims, projectId: number, input: CreateTaskInput): Promise<IdCommandResult> {
        assertAdmin(auth);
        const task = await this.taskWriter.create(auth.userId, projectId, input);

        if (!task) {
            throw operationsErrors.projectNotFound();
        }

        return { id: task.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updateTask(auth: AuthClaims, taskId: number, input: UpdateTaskInput): Promise<IdCommandResult> {
        const result = await this.taskWriter.update(auth, taskId, input);

        if (!result) {
            throw operationsErrors.taskNotFound();
        }

        if (!TaskDomain.canUpdate(result.task, auth, input) || !result.changedId) {
            throw operationsErrors.taskMutationForbidden();
        }

        return { id: result.changedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createApprovalRequest(auth: AuthClaims, input: CreateApprovalRequestInput): Promise<IdCommandResult> {
        const request = await this.approvalRequestWriter.create(auth.userId, input);

        if (!request) {
            throw operationsErrors.projectNotFound();
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
            throw operationsErrors.approvalRequestNotFound();
        }

        if (ApprovalRequestDomain.isReviewed(result.request) || !result.changedId) {
            throw operationsErrors.approvalRequestAlreadyReviewed();
        }

        return { id: result.changedId };
    }
}

function assertAdmin(auth: AuthClaims) {
    if (auth.role !== "ADMIN") {
        throw operationsErrors.adminRequired();
    }
}
