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
import { ApprovalRequestDomain, DashboardViewDomain, ProjectDomain, TaskDomain } from "@/features/operations/domain";
import {
    approvalRequestNotFoundError,
    projectNotFoundError,
    taskNotFoundError
} from "@/features/operations/operations-errors";
import {
    ApprovalRequestReader,
    DashboardViewQuery,
    ProjectReader,
    TaskReader,
    UserReader
} from "@/features/operations/repository";

const DASHBOARD_LIMIT = 5;

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
        const page = await this.projectReader.list(query);

        return {
            items: page.items.map(ProjectDomain.toProject),
            page: page.page,
            pageSize: page.pageSize,
            total: page.total
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getProject(projectId: number): Promise<ProjectDetail> {
        const project = await this.projectReader.findById(projectId);

        if (!project) {
            throw projectNotFoundError();
        }

        return ProjectDomain.toProject(project);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listProjectTasks(projectId: number): Promise<TaskSummary[]> {
        const project = await this.projectReader.findById(projectId);

        if (!project) {
            throw projectNotFoundError();
        }

        const tasks = await this.taskReader.listByProjectId(projectId);

        return tasks.map(TaskDomain.toTask);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getTask(taskId: number): Promise<TaskDetail> {
        const task = await this.taskReader.findById(taskId);

        if (!task) {
            throw taskNotFoundError();
        }

        return TaskDomain.toTask(task);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listApprovalRequests(query: ApprovalRequestListQuery): Promise<ApprovalRequestListResult> {
        const page = await this.approvalRequestReader.list(query);

        return {
            items: page.items.map(ApprovalRequestDomain.toApprovalRequest),
            page: page.page,
            pageSize: page.pageSize,
            total: page.total
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getApprovalRequest(requestId: number): Promise<ApprovalRequestDetail> {
        const request = await this.approvalRequestReader.findById(requestId);

        if (!request) {
            throw approvalRequestNotFoundError();
        }

        return ApprovalRequestDomain.toApprovalRequest(request);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getDashboard(userId: number): Promise<Dashboard> {
        const dashboardView = await this.dashboardViewQuery.get(userId, DASHBOARD_LIMIT);

        return DashboardViewDomain.toDashboard(dashboardView);
    }
}
