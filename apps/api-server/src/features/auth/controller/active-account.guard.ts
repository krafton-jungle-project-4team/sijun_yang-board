import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { activeAccountRequiredError } from "../auth-errors";
import type { RequestWithAuth } from "./auth-request";

@Injectable()
export class ActiveAccountGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<RequestWithAuth>();

        if (request.auth.status !== "ACTIVE") {
            throw activeAccountRequiredError();
        }

        return true;
    }
}
