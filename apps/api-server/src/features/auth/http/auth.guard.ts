import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { authErrors } from "@/features/auth/auth-errors";
import { AuthQueryService } from "@/features/auth/service";
import { setRequestAuth } from "./request-auth-context";

/**
 * route handler 실행 전에 인증된 non-anonymous session을 요구한다.
 *
 * request context에 CurrentAuth claims가 필요한 route에서 사용한다.
 * authorization 판단은 role guard나 feature check에 두고 이 guard는 authentication 밖으로 확장하지 않는다.
 */
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authQuery: AuthQueryService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const claims = await this.authQuery.getClaimsByRequest(request);

        if (!claims) {
            throw authErrors.unauthenticated();
        }

        setRequestAuth(request, claims);
        return true;
    }
}
