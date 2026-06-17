import type { AuthClaims } from "@/features/auth";
import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import {
    approvalRequestListQuerySchema,
    createApprovalRequestInputSchema,
    numericIdParamSchema,
    reviewApprovalRequestInputSchema
} from "@nmm/shared";

import { AuthGuard, CurrentAuth, RoleGuard, Roles } from "@/features/auth";
import { OperationsCommandService, OperationsQueryService } from "@/features/operations/service";

@Controller("requests")
@UseGuards(AuthGuard)
export class ApprovalRequestsController {
    constructor(
        private readonly operationsQuery: OperationsQueryService,
        private readonly operationsCommand: OperationsCommandService
    ) {}

    @Get()
    async listRequests(@Query() query: unknown) {
        return this.operationsQuery.listApprovalRequests(approvalRequestListQuerySchema.parse(query));
    }

    @Post()
    async createRequest(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = createApprovalRequestInputSchema.parse(body);

        return this.operationsCommand.createApprovalRequest(auth, input);
    }

    @Get(":requestId")
    async getRequest(@Param("requestId") requestId: string) {
        return this.operationsQuery.getApprovalRequest(numericIdParamSchema.parse(requestId));
    }

    @Post(":requestId/approve")
    @Roles("ADMIN")
    @UseGuards(RoleGuard)
    async approveRequest(
        @CurrentAuth() auth: AuthClaims,
        @Param("requestId") requestId: string,
        @Body() body: unknown
    ) {
        const input = reviewApprovalRequestInputSchema.parse(body ?? {});

        return this.operationsCommand.approveRequest(auth, numericIdParamSchema.parse(requestId), input);
    }

    @Post(":requestId/reject")
    @Roles("ADMIN")
    @UseGuards(RoleGuard)
    async rejectRequest(@CurrentAuth() auth: AuthClaims, @Param("requestId") requestId: string, @Body() body: unknown) {
        const input = reviewApprovalRequestInputSchema.parse(body ?? {});

        return this.operationsCommand.rejectRequest(auth, numericIdParamSchema.parse(requestId), input);
    }
}
