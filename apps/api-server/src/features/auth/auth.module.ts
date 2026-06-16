import { Module } from "@nestjs/common";

import { AuthController } from "./controller/auth.controller";
import { AuthCommandService, AuthQueryService } from "./service";

@Module({
    controllers: [AuthController],
    providers: [AuthQueryService, AuthCommandService],
    exports: [AuthQueryService]
})
export class AuthModule {}
