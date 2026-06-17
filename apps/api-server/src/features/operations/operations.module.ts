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

/**
 * operations feature의 controller, service, repository를 연결한다.
 *
 * project, task, approval request, dashboard 흐름을 제공하는 module로 사용한다.
 * 인증은 AuthModule의 public boundary를 통해 받고 feature 내부 repository를 외부로 노출하지 않는다.
 */
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
