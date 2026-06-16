import type { AuthClaims } from "@nmm/shared";
import { Controller, Get, UseGuards } from "@nestjs/common";

import { ActiveAccountGuard, CurrentAuth, SessionUserGuard } from "../../auth";
import { OperationsQueryService } from "../service";

@Controller("dashboard")
@UseGuards(SessionUserGuard, ActiveAccountGuard)
export class DashboardController {
    constructor(private readonly operationsQuery: OperationsQueryService) {}

    @Get()
    async getDashboard(@CurrentAuth() auth: AuthClaims) {
        return this.operationsQuery.getDashboard(auth.userId);
    }
}
