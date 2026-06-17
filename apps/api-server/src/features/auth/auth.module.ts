import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/infra/database";
import { AuthController } from "./controller/auth.controller";
import { AuthenticatedUserGuard, OptionalAuthGuard } from "./http";
import { BetterAuthProvider } from "./provider";
import { UserReader, UserWriter } from "./repository";
import { AuthCommandService, AuthQueryService } from "./service";

@Module({
    imports: [DatabaseModule],
    controllers: [AuthController],
    providers: [
        AuthQueryService,
        AuthCommandService,
        BetterAuthProvider,
        AuthenticatedUserGuard,
        OptionalAuthGuard,
        UserReader,
        UserWriter
    ],
    exports: [AuthenticatedUserGuard, OptionalAuthGuard]
})
export class AuthModule {}
