import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { unauthenticatedError } from "@/features/auth/auth-errors";
import { AuthQueryService } from "@/features/auth/service";
import { setRequestAuth } from "./request-auth-context";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authQuery: AuthQueryService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const claims = await this.authQuery.getClaimsByRequest(request);

        if (!claims) {
            throw unauthenticatedError();
        }

        setRequestAuth(request, claims);
        return true;
    }
}
