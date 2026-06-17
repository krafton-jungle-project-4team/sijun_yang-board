import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthGuard, RoleGuard, Roles } from "@/features/auth";
import { OperationsQueryService } from "@/features/operations/service";

@Controller("users")
@Roles("ADMIN")
@UseGuards(AuthGuard, RoleGuard)
export class UsersController {
    constructor(private readonly operationsQuery: OperationsQueryService) {}

    @Get()
    async listUsers() {
        return this.operationsQuery.listUsers();
    }
}
