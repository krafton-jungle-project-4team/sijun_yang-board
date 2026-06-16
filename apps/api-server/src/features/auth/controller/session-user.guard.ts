import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { authEnv } from "../auth.env";
import { suspendedAccountError, unauthenticatedError } from "../auth-errors";
import { AuthQueryService } from "../service";
import type { RequestWithAuth } from "./auth-request";

@Injectable()
export class SessionUserGuard implements CanActivate {
    constructor(private readonly authQuery: AuthQueryService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithAuth>();
        const sessionId = readSessionId(request);

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

function readSessionId(request: Request): string | null {
    const authorization = request.header("authorization");

    if (authorization?.startsWith("Bearer ")) {
        return authorization.slice("Bearer ".length);
    }

    const cookieHeader = request.header("cookie");

    if (!cookieHeader) {
        return null;
    }

    const sessionCookie = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${authEnv.sessionCookieName}=`));

    if (!sessionCookie) {
        return null;
    }

    return decodeURIComponent(sessionCookie.slice(authEnv.sessionCookieName.length + 1));
}
