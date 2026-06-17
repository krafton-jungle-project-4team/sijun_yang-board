import type { AuthClaims } from "@/features/auth";
import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { numericIdParamSchema, updateTaskInputSchema } from "@nmm/shared";

import { AuthGuard, CurrentAuth } from "@/features/auth";
import { OperationsCommandService, OperationsQueryService } from "@/features/operations/service";

/**
 * 개별 task 조회와 수정 HTTP route를 처리한다.
 *
 * 인증된 사용자가 task detail을 보거나 담당자/관리자 권한으로 task를 변경할 때 사용한다.
 * task별 수정 가능 여부는 domain helper와 command service가 판단하게 한다.
 */
@Controller("tasks")
@UseGuards(AuthGuard)
export class TasksController {
    constructor(
        private readonly operationsQuery: OperationsQueryService,
        private readonly operationsCommand: OperationsCommandService
    ) {}

    @Get(":taskId")
    async getTask(@Param("taskId") taskId: string) {
        return this.operationsQuery.getTask(numericIdParamSchema.parse(taskId));
    }

    @Patch(":taskId")
    async updateTask(@CurrentAuth() auth: AuthClaims, @Param("taskId") taskId: string, @Body() body: unknown) {
        const input = updateTaskInputSchema.parse(body);

        return this.operationsCommand.updateTask(auth, numericIdParamSchema.parse(taskId), input);
    }
}
