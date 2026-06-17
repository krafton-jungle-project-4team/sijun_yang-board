import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/infra/database";
import { AuthController } from "./controller/auth.controller";
import { AuthGuard, RoleGuard } from "./http";
import { BetterAuthProvider } from "./provider";
import { UserReader, UserWriter } from "./repository";
import { AuthCommandService, AuthQueryService } from "./service";

/**
 * authentication feature의 controller, guard, provider, service, repository를 연결한다.
 *
 * 다른 feature가 request authentication이나 현재 사용자 조회를 필요로 할 때 이 module을 사용한다.
 * account persistence와 session 동작은 auth feature 안에 두고 내부 구현을 다른 곳에서 직접 import하지 않는다.
 */
@Module({
    imports: [DatabaseModule],
    controllers: [AuthController],
    providers: [AuthQueryService, AuthCommandService, BetterAuthProvider, AuthGuard, RoleGuard, UserReader, UserWriter],
    exports: [AuthGuard, RoleGuard, AuthQueryService]
})
export class AuthModule {}
