import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthenticatedUserGuard } from "@/features/auth";
import { OperationsQueryService } from "@/features/operations/service";

@Controller("users")
@UseGuards(AuthenticatedUserGuard)
export class UsersController {
    constructor(private readonly operationsQuery: OperationsQueryService) {}

    @Get()
    async listUsers() {
        return this.operationsQuery.listUsers();
    }
}
