import type {
    ApprovalRequestDetail,
    ApprovalRequestListQuery,
    ApprovalRequestListResult,
    Dashboard,
    ProjectDetail,
    ProjectListQuery,
    ProjectListResult,
    TaskDetail,
    TaskSummary,
    UserOption
} from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { operationsErrors } from "@/features/operations/operations-errors";
import {
    ApprovalRequestReader,
    DashboardViewQuery,
    ProjectReader,
    TaskReader,
    UserReader
} from "@/features/operations/repository";

const DASHBOARD_LIMIT = 5;

/**
 * operations feature의 read use case와 dashboard projection을 조율한다.
 *
 * project, task, approval request, user option, dashboard 데이터를 shared contract로 반환할 때 사용한다.
 * repository row는 domain mapper를 거쳐 내보내고 missing entity는 여기에서 domain error로 변환한다.
 */
@Injectable()
export class OperationsQueryService {
    constructor(
        private readonly userReader: UserReader,
        private readonly projectReader: ProjectReader,
        private readonly taskReader: TaskReader,
        private readonly approvalRequestReader: ApprovalRequestReader,
        private readonly dashboardViewQuery: DashboardViewQuery
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async listUsers(): Promise<UserOption[]> {
        return this.userReader.list();
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listProjects(query: ProjectListQuery): Promise<ProjectListResult> {
        return this.projectReader.list(query);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getProject(projectId: number): Promise<ProjectDetail> {
        const project = await this.projectReader.findById(projectId);

        if (!project) {
            throw operationsErrors.projectNotFound();
        }

        return project;
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listProjectTasks(projectId: number): Promise<TaskSummary[]> {
        const project = await this.projectReader.findById(projectId);

        if (!project) {
            throw operationsErrors.projectNotFound();
        }

        return this.taskReader.listByProjectId(projectId);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getTask(taskId: number): Promise<TaskDetail> {
        const task = await this.taskReader.findById(taskId);

        if (!task) {
            throw operationsErrors.taskNotFound();
        }

        return task;
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listApprovalRequests(query: ApprovalRequestListQuery): Promise<ApprovalRequestListResult> {
        return this.approvalRequestReader.list(query);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getApprovalRequest(requestId: number): Promise<ApprovalRequestDetail> {
        const request = await this.approvalRequestReader.findById(requestId);

        if (!request) {
            throw operationsErrors.approvalRequestNotFound();
        }

        return request;
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getDashboard(userId: number): Promise<Dashboard> {
        return this.dashboardViewQuery.get(userId, DASHBOARD_LIMIT);
    }
}
