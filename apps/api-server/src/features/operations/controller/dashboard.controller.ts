import type { AuthClaims } from "@/features/auth";
import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthGuard, CurrentAuth } from "@/features/auth";
import { OperationsQueryService } from "@/features/operations/service";

/**
 * 로그인 사용자의 dashboard HTTP route를 처리한다.
 *
 * web client가 첫 화면 요약, 내 task, pending request, 최근 공지를 한 번에 필요로 할 때 사용한다.
 * dashboard 구성 쿼리는 service와 view query에 위임해 controller가 집계 로직을 갖지 않게 한다.
 */
@Controller("dashboard")
@UseGuards(AuthGuard)
export class DashboardController {
    constructor(private readonly operationsQuery: OperationsQueryService) {}

    @Get()
    async getDashboard(@CurrentAuth() auth: AuthClaims) {
        return this.operationsQuery.getDashboard(auth.userId);
    }
}
