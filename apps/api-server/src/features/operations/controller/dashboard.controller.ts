import type { AuthClaims } from "@nmm/shared";
import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthenticatedUserGuard, CurrentAuth } from "../../auth";
import { OperationsQueryService } from "../service";

@Controller("dashboard")
@UseGuards(AuthenticatedUserGuard)
export class DashboardController {
    constructor(private readonly operationsQuery: OperationsQueryService) {}

    @Get()
    async getDashboard(@CurrentAuth() auth: AuthClaims) {
        return this.operationsQuery.getDashboard(auth.userId);
    }
}
