import type { UserRole } from "@nmm/shared";
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { authErrors } from "@/features/auth/auth-errors";
import { getRequestAuth } from "./request-auth-context";

const ROLES_METADATA_KEY = "auth:roles";

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_METADATA_KEY, roles);

/**
 * authentication이 request claims를 채운 뒤 route-level role metadata를 강제한다.
 *
 * admin 또는 role별 접근이 필요한 endpoint에서 Roles metadata와 함께 사용한다.
 * role check 전에 authentication 누락이 일관되게 보고되도록 AuthGuard와 함께 둔다.
 */
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
            throw authErrors.unauthenticated();
        }

        if (!allowedRoles.includes(auth.role)) {
            throw authErrors.forbidden();
        }

        return true;
    }
}
