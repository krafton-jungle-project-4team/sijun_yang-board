import type { AuthClaims } from "@/features/auth";
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
    createProjectInputSchema,
    createTaskInputSchema,
    numericIdParamSchema,
    projectListQuerySchema,
    updateProjectInputSchema
} from "@nmm/shared";

import { AuthenticatedUserGuard, CurrentAuth } from "@/features/auth";
import { OperationsCommandService, OperationsQueryService } from "@/features/operations/service";

@Controller("projects")
@UseGuards(AuthenticatedUserGuard)
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
    async createProject(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = createProjectInputSchema.parse(body);

        return this.operationsCommand.createProject(auth, input);
    }

    @Get(":projectId")
    async getProject(@Param("projectId") projectId: string) {
        return this.operationsQuery.getProject(numericIdParamSchema.parse(projectId));
    }

    @Patch(":projectId")
    async updateProject(@CurrentAuth() auth: AuthClaims, @Param("projectId") projectId: string, @Body() body: unknown) {
        const input = updateProjectInputSchema.parse(body);

        return this.operationsCommand.updateProject(auth, numericIdParamSchema.parse(projectId), input);
    }

    @Get(":projectId/tasks")
    async listProjectTasks(@Param("projectId") projectId: string) {
        return this.operationsQuery.listProjectTasks(numericIdParamSchema.parse(projectId));
    }

    @Post(":projectId/tasks")
    async createTask(@CurrentAuth() auth: AuthClaims, @Param("projectId") projectId: string, @Body() body: unknown) {
        const input = createTaskInputSchema.parse(body);

        return this.operationsCommand.createTask(auth, numericIdParamSchema.parse(projectId), input);
    }
}
