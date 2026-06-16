import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { suspendedAccountError, unauthenticatedError } from "../auth-errors";
import { AuthQueryService } from "../service";
import type { RequestWithAuth } from "./auth-request";

@Injectable()
export class AuthenticatedUserGuard implements CanActivate {
    constructor(private readonly authQuery: AuthQueryService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithAuth>();
        const claims = await this.authQuery.getClaimsByRequest(request);

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
