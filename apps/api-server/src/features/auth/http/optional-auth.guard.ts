import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { AuthQueryService } from "@/features/auth/service";
import type { RequestWithAuth } from "./auth-request";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
    constructor(private readonly authQuery: AuthQueryService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithAuth>();
        const claims = await this.authQuery.getClaimsByRequest(request);

        if (claims) {
            request.auth = claims;
        }

        return true;
    }
}
