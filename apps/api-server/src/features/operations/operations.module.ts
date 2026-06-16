import { Module } from "@nestjs/common";

import { AuthModule } from "../auth";
import { ApprovalRequestsController } from "./controller/approval-requests.controller";
import { DashboardController } from "./controller/dashboard.controller";
import { ProjectsController } from "./controller/projects.controller";
import { TasksController } from "./controller/tasks.controller";
import { UsersController } from "./controller/users.controller";
import { OperationsCommandService, OperationsQueryService } from "./service";

@Module({
    imports: [AuthModule],
    controllers: [
        ProjectsController,
        TasksController,
        ApprovalRequestsController,
        DashboardController,
        UsersController
    ],
    providers: [OperationsQueryService, OperationsCommandService]
})
export class OperationsModule {}
