import type { AuthClaims } from "@/features/auth";
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
    createProjectInputSchema,
    createTaskInputSchema,
    numericIdParamSchema,
    projectListQuerySchema,
    updateProjectInputSchema
} from "@nmm/shared";

import { AuthGuard, CurrentAuth, RoleGuard, Roles } from "@/features/auth";
import { OperationsCommandService, OperationsQueryService } from "@/features/operations/service";

/**
 * project와 project task 관련 HTTP route를 처리한다.
 *
 * 인증된 사용자의 project list/detail 조회와 admin 전용 project/task 생성을 위해 사용한다.
 * request parsing과 guard metadata만 담당하고 권한 재검증과 mutation rule은 service에 둔다.
 */
@Controller("projects")
@UseGuards(AuthGuard)
export class ProjectsController {
    constructor(
        private readonly operationsQuery: OperationsQueryService,
        private readonly operationsCommand: OperationsCommandService
    ) {}

    @Get()
    async listProjects(@Query() query: unknown) {
        return this.operationsQuery.listProjects(projectListQuerySchema.parse(query));
    }

    @Post()
    @Roles("ADMIN")
    @UseGuards(RoleGuard)
    async createProject(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = createProjectInputSchema.parse(body);

        return this.operationsCommand.createProject(auth, input);
    }

    @Get(":projectId")
    async getProject(@Param("projectId") projectId: string) {
        return this.operationsQuery.getProject(numericIdParamSchema.parse(projectId));
    }

    @Patch(":projectId")
    @Roles("ADMIN")
    @UseGuards(RoleGuard)
    async updateProject(@CurrentAuth() auth: AuthClaims, @Param("projectId") projectId: string, @Body() body: unknown) {
        const input = updateProjectInputSchema.parse(body);

        return this.operationsCommand.updateProject(auth, numericIdParamSchema.parse(projectId), input);
    }

    @Get(":projectId/tasks")
    async listProjectTasks(@Param("projectId") projectId: string) {
        return this.operationsQuery.listProjectTasks(numericIdParamSchema.parse(projectId));
    }

    @Post(":projectId/tasks")
    @Roles("ADMIN")
    @UseGuards(RoleGuard)
    async createTask(@CurrentAuth() auth: AuthClaims, @Param("projectId") projectId: string, @Body() body: unknown) {
        const input = createTaskInputSchema.parse(body);

        return this.operationsCommand.createTask(auth, numericIdParamSchema.parse(projectId), input);
    }
}
