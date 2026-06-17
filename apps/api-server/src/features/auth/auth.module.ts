import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/infra/database";
import { AuthController } from "./controller/auth.controller";
import { AuthGuard, RoleGuard } from "./http";
import { BetterAuthProvider } from "./provider";
import { UserReader, UserWriter } from "./repository";
import { AuthCommandService, AuthQueryService } from "./service";

@Module({
    imports: [DatabaseModule],
    controllers: [AuthController],
    providers: [AuthQueryService, AuthCommandService, BetterAuthProvider, AuthGuard, RoleGuard, UserReader, UserWriter],
    exports: [AuthGuard, RoleGuard, AuthQueryService]
})
export class AuthModule {}
