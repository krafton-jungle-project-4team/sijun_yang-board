import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/infra/database";
import { AuthController } from "./controller/auth.controller";
import { AuthenticatedUserGuard } from "./controller/authenticated-user.guard";
import { OptionalAuthGuard } from "./controller/optional-auth.guard";
import { SessionWriter, UserReader, UserWriter } from "./repository";
import { AuthCommandService, AuthQueryService, BetterAuthService } from "./service";

@Module({
    imports: [DatabaseModule],
    controllers: [AuthController],
    providers: [
        AuthQueryService,
        AuthCommandService,
        BetterAuthService,
        AuthenticatedUserGuard,
        OptionalAuthGuard,
        UserReader,
        UserWriter,
        SessionWriter
    ],
    exports: [AuthenticatedUserGuard, OptionalAuthGuard]
})
export class AuthModule {}
