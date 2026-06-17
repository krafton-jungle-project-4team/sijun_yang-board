import type { AuthClaims } from "@/features/auth";
import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthenticatedUserGuard, CurrentAuth } from "@/features/auth";
import { OperationsQueryService } from "@/features/operations/service";

@Controller("dashboard")
@UseGuards(AuthenticatedUserGuard)
export class DashboardController {
    constructor(private readonly operationsQuery: OperationsQueryService) {}

    @Get()
    async getDashboard(@CurrentAuth() auth: AuthClaims) {
        return this.operationsQuery.getDashboard(auth.userId);
    }
}
