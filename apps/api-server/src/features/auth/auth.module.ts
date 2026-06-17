import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/infra/database";
import { AuthController } from "./controller/auth.controller";
import { AuthenticatedUserGuard, OptionalAuthGuard } from "./http";
import { BetterAuthProvider } from "./provider";
import { SessionWriter, UserReader, UserWriter } from "./repository";
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
        UserWriter,
        SessionWriter
    ],
    exports: [AuthenticatedUserGuard, OptionalAuthGuard]
})
export class AuthModule {}
