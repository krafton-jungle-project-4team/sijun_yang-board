import type { UserRole } from "@nmm/shared";
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { forbiddenAuthError, unauthenticatedError } from "@/features/auth/auth-errors";
import { getRequestAuth } from "./request-auth-context";

const ROLES_METADATA_KEY = "auth:roles";

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_METADATA_KEY, roles);

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_METADATA_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (!allowedRoles?.length) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const auth = getRequestAuth(request);

        if (!auth) {
            throw unauthenticatedError();
        }

        if (!allowedRoles.includes(auth.role)) {
            throw forbiddenAuthError();
        }

        return true;
    }
}
