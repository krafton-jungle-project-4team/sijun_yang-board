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
import { InjectTransaction, Transactional, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { approvalRequestNotFoundError, projectNotFoundError, taskNotFoundError } from "../operations-errors";
import {
    countApprovalRequests,
    countProjects,
    getApprovalRequestById,
    getDashboardCounts,
    getProjectById,
    getTaskById,
    listActiveUsers,
    listApprovalRequests,
    listDashboardMyTasks,
    listDashboardPendingRequests,
    listDashboardRecentPosts,
    listProjects,
    listTasksByProjectId
} from "../database/__generated__/operations.queries";
import {
    toApprovalRequestSummary,
    toDashboardSummary,
    toProjectSummary,
    toTaskSummary,
    toUserOption
} from "./operations-mappers";

const DASHBOARD_LIMIT = 5;

@Injectable()
export class OperationsQueryService {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async listUsers(): Promise<UserOption[]> {
        const users = await this.db.query(listActiveUsers, undefined).multiple();

        return users.map(toUserOption);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listProjects(query: ProjectListQuery): Promise<ProjectListResult> {
        const filters = {
            search: query.search ?? null,
            status: query.status === "ALL" ? null : query.status
        };
        const items = await this.db
            .query(listProjects, {
                ...filters,
                sort: query.sort,
                limit: query.pageSize,
                offset: (query.page - 1) * query.pageSize
            })
            .multiple();
        const total = await this.db.query(countProjects, filters).single();

        return {
            items: items.map(toProjectSummary),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getProject(projectId: number): Promise<ProjectDetail> {
        const project = await this.db.query(getProjectById, { projectId }).singleOrNull();

        if (!project) {
            throw projectNotFoundError();
        }

        return toProjectSummary(project);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listProjectTasks(projectId: number): Promise<TaskSummary[]> {
        await this.getProject(projectId);
        const tasks = await this.db.query(listTasksByProjectId, { projectId }).multiple();

        return tasks.map(toTaskSummary);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getTask(taskId: number): Promise<TaskDetail> {
        const task = await this.db.query(getTaskById, { taskId }).singleOrNull();

        if (!task) {
            throw taskNotFoundError();
        }

        return toTaskSummary(task);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listApprovalRequests(query: ApprovalRequestListQuery): Promise<ApprovalRequestListResult> {
        const filters = {
            projectId: query.projectId ?? null,
            search: query.search ?? null,
            status: query.status === "ALL" ? null : query.status
        };
        const items = await this.db
            .query(listApprovalRequests, {
                ...filters,
                sort: query.sort,
                limit: query.pageSize,
                offset: (query.page - 1) * query.pageSize
            })
            .multiple();
        const total = await this.db.query(countApprovalRequests, filters).single();

        return {
            items: items.map(toApprovalRequestSummary),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getApprovalRequest(requestId: number): Promise<ApprovalRequestDetail> {
        const request = await this.db.query(getApprovalRequestById, { requestId }).singleOrNull();

        if (!request) {
            throw approvalRequestNotFoundError();
        }

        return toApprovalRequestSummary(request);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getDashboard(userId: number): Promise<Dashboard> {
        const [counts, myTasks, pendingRequests, recentAnnouncements] = await Promise.all([
            this.db.query(getDashboardCounts, undefined).single(),
            this.db.query(listDashboardMyTasks, { assigneeId: userId, limit: DASHBOARD_LIMIT }).multiple(),
            this.db.query(listDashboardPendingRequests, { limit: DASHBOARD_LIMIT }).multiple(),
            this.db.query(listDashboardRecentPosts, { limit: DASHBOARD_LIMIT }).multiple()
        ]);

        return toDashboardSummary(counts, myTasks, pendingRequests, recentAnnouncements);
    }
}
