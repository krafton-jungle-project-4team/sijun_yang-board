import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import {
    getDashboardCounts,
    listDashboardMyTasks,
    listDashboardPendingRequests,
    listDashboardRecentPosts
} from "../database/__generated__/operations.queries";
import type { DashboardView } from "../domain";
import { toApprovalRequestSnapshot } from "./approval-request-reader";
import { toTaskSnapshot } from "./task-reader";

@Injectable()
export class DashboardViewQuery {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async get(userId: number, limit: number): Promise<DashboardView> {
        const [counts, myTasks, pendingRequests, recentAnnouncements] = await Promise.all([
            this.db.query(getDashboardCounts, undefined).single(),
            this.db.query(listDashboardMyTasks, { assigneeId: userId, limit }).multiple(),
            this.db.query(listDashboardPendingRequests, { limit }).multiple(),
            this.db.query(listDashboardRecentPosts, { limit }).multiple()
        ]);

        return {
            counts: {
                activeProjectCount: counts.activeProjectCount ?? 0,
                inProgressTaskCount: counts.inProgressTaskCount ?? 0
            },
            myTasks: myTasks.map(toTaskSnapshot),
            pendingRequests: pendingRequests.map(toApprovalRequestSnapshot),
            recentAnnouncements: recentAnnouncements.map((post) => ({
                id: post.id,
                title: post.title,
                content: post.content,
                authorId: post.authorId,
                authorName: post.authorName,
                commentCount: post.commentCount ?? 0,
                viewCount: post.viewCount,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }))
        };
    }
}
