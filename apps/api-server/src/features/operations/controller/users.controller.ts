import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthenticatedUserGuard } from "../../auth";
import { OperationsQueryService } from "../service";

@Controller("users")
@UseGuards(AuthenticatedUserGuard)
export class UsersController {
    constructor(private readonly operationsQuery: OperationsQueryService) {}

    @Get()
    async listUsers() {
        return this.operationsQuery.listUsers();
    }
}
