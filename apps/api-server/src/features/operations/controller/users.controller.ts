import { Controller, Get, UseGuards } from "@nestjs/common";

import { ActiveAccountGuard, SessionUserGuard } from "../../auth";
import { OperationsQueryService } from "../service";

@Controller("users")
@UseGuards(SessionUserGuard, ActiveAccountGuard)
export class UsersController {
    constructor(private readonly operationsQuery: OperationsQueryService) {}

    @Get()
    async listUsers() {
        return this.operationsQuery.listUsers();
    }
}
