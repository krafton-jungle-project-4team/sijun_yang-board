import { Module } from "@nestjs/common";

import { AuthController } from "./controller/auth.controller";
import { SessionWriter, UserReader, UserWriter } from "./repository";
import { AuthCommandService, AuthQueryService } from "./service";

@Module({
    controllers: [AuthController],
    providers: [AuthQueryService, AuthCommandService, UserReader, UserWriter, SessionWriter],
    exports: [AuthQueryService]
})
export class AuthModule {}
