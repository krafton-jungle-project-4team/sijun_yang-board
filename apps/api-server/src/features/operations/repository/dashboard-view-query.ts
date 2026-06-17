import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import {
    getDashboardCounts,
    listDashboardMyTasks,
    listDashboardPendingRequests,
    listDashboardRecentPosts
} from "@/features/operations/database/__generated__/operations.queries";
import type { DashboardView } from "@/features/operations/domain";
import { toApprovalRequestSnapshot } from "./approval-request-reader";
import { toTaskSnapshot } from "./task-reader";

/**
 * dashboard 화면에 필요한 여러 read model을 한 번에 조회한다.
 *
 * operations query service가 사용자별 dashboard projection을 만들 때 사용한다.
 * 화면 전용 query이므로 일반 repository 규칙보다 조회 성능과 집계 형태를 우선한다.
 */
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
