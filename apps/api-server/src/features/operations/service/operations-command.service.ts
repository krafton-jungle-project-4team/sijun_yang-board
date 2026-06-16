import type {
    ApprovalRequestStatus,
    AuthClaims,
    CreateApprovalRequestInput,
    CreateProjectInput,
    CreateTaskInput,
    IdCommandResult,
    ReviewApprovalRequestInput,
    UpdateProjectInput,
    UpdateTaskInput
} from "@nmm/shared";
import { InjectTransaction, Transactional, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import {
    adminRequiredError,
    approvalRequestAlreadyReviewedError,
    approvalRequestNotFoundError,
    projectNotFoundError,
    taskMutationForbiddenError,
    taskNotFoundError
} from "../operations-errors";
import {
    createApprovalRequest,
    createProject,
    createTask,
    reviewApprovalRequest,
    updateProject,
    updateTask
} from "../database/__generated__/operations.queries";

@Injectable()
export class OperationsCommandService {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async createProject(auth: AuthClaims, input: CreateProjectInput): Promise<IdCommandResult> {
        assertAdmin(auth);
        const project = await this.db
            .query(createProject, {
                name: input.name,
                description: input.description,
                status: input.status,
                ownerId: input.ownerId ?? null,
                createdById: auth.userId
            })
            .single();

        return { id: project.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updateProject(auth: AuthClaims, projectId: number, input: UpdateProjectInput): Promise<IdCommandResult> {
        assertAdmin(auth);
        const project = await this.db
            .query(updateProject, {
                projectId,
                name: input.name ?? null,
                description: input.description ?? null,
                status: input.status ?? null,
                ownerId: input.ownerId ?? null
            })
            .singleOrNull();

        if (!project) {
            throw projectNotFoundError();
        }

        return { id: project.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createTask(auth: AuthClaims, projectId: number, input: CreateTaskInput): Promise<IdCommandResult> {
        assertAdmin(auth);
        const task = await this.db
            .query(createTask, {
                projectId,
                title: input.title,
                description: input.description,
                status: input.status,
                priority: input.priority,
                assigneeId: input.assigneeId ?? null,
                createdById: auth.userId
            })
            .singleOrNull();

        if (!task) {
            throw projectNotFoundError();
        }

        return { id: task.taskId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updateTask(auth: AuthClaims, taskId: number, input: UpdateTaskInput): Promise<IdCommandResult> {
        const adminFieldPatch =
            input.title !== undefined ||
            input.description !== undefined ||
            input.priority !== undefined ||
            input.assigneeId !== undefined;
        const task = await this.db
            .query(updateTask, {
                taskId,
                title: input.title ?? null,
                description: input.description ?? null,
                status: input.status ?? null,
                priority: input.priority ?? null,
                assigneeId: input.assigneeId ?? null,
                replaceAssignee: input.assigneeId !== undefined,
                adminFieldPatch,
                actorId: auth.userId,
                actorRole: auth.role
            })
            .singleOrNull();

        if (!task) {
            throw taskNotFoundError();
        }

        if (!task.updatedId) {
            throw taskMutationForbiddenError();
        }

        return { id: task.updatedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createApprovalRequest(auth: AuthClaims, input: CreateApprovalRequestInput): Promise<IdCommandResult> {
        const request = await this.db
            .query(createApprovalRequest, {
                projectId: input.projectId,
                title: input.title,
                description: input.description,
                requesterId: auth.userId
            })
            .singleOrNull();

        if (!request) {
            throw projectNotFoundError();
        }

        return { id: request.requestId };
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
        const request = await this.db
            .query(reviewApprovalRequest, {
                requestId,
                nextStatus,
                reviewerId: auth.userId,
                reviewComment: input.reviewComment ?? null
            })
            .singleOrNull();

        if (!request) {
            throw approvalRequestNotFoundError();
        }

        if (!request.reviewedId) {
            throw approvalRequestAlreadyReviewedError();
        }

        return { id: request.reviewedId };
    }
}

function assertAdmin(auth: AuthClaims) {
    if (auth.role !== "ADMIN") {
        throw adminRequiredError();
    }
}
