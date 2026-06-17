import { Module } from "@nestjs/common";

import { AuthModule } from "@/features/auth";
import { ApprovalRequestsController } from "./controller/approval-requests.controller";
import { DashboardController } from "./controller/dashboard.controller";
import { ProjectsController } from "./controller/projects.controller";
import { TasksController } from "./controller/tasks.controller";
import { UsersController } from "./controller/users.controller";
import {
    ApprovalRequestReader,
    ApprovalRequestWriter,
    DashboardViewQuery,
    ProjectReader,
    ProjectWriter,
    TaskReader,
    TaskWriter,
    UserReader
} from "./repository";
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
    providers: [
        OperationsQueryService,
        OperationsCommandService,
        UserReader,
        ProjectReader,
        ProjectWriter,
        TaskReader,
        TaskWriter,
        ApprovalRequestReader,
        ApprovalRequestWriter,
        DashboardViewQuery
    ]
})
export class OperationsModule {}
