import type { AuthClaims } from "@nmm/shared";
import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { numericIdParamSchema, updateTaskInputSchema } from "@nmm/shared";

import { AuthenticatedUserGuard, CurrentAuth } from "@/features/auth";
import { OperationsCommandService, OperationsQueryService } from "@/features/operations/service";

@Controller("tasks")
@UseGuards(AuthenticatedUserGuard)
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
