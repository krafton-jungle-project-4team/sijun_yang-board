import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthGuard, RoleGuard, Roles } from "@/features/auth";
import { OperationsQueryService } from "@/features/operations/service";

/**
 * operations 화면에서 사용할 사용자 option HTTP route를 처리한다.
 *
 * admin이 project owner나 task assignee를 선택해야 하는 흐름에서 사용한다.
 * 이 endpoint는 admin 전용이므로 AuthGuard와 RoleGuard를 함께 유지한다.
 */
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
