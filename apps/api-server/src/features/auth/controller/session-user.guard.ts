import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { suspendedAccountError, unauthenticatedError } from "../auth-errors";
import { AuthQueryService } from "../service";
import type { RequestWithAuth } from "./auth-request";
import { getSessionIdFromRequest } from "./session-cookie";

@Injectable()
export class SessionUserGuard implements CanActivate {
    constructor(private readonly authQuery: AuthQueryService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithAuth>();
        const sessionId = getSessionIdFromRequest(request);

        if (!sessionId) {
            throw unauthenticatedError();
        }

        const claims = await this.authQuery.getClaimsBySessionId(sessionId);

        if (!claims) {
            throw unauthenticatedError();
        }

        if (claims.status === "SUSPENDED") {
            throw suspendedAccountError();
        }

        request.auth = claims;
        return true;
    }
}
