import type { AuthClaims, User } from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";

import { AppError } from "@/app-errors";
import { PgTypedTransactionalAdapter } from "@/infra/database";
import { UserAccountDomain } from "@/features/auth/domain";
import { UserReader } from "@/features/auth/repository";
import { BetterAuthService } from "./better-auth.service";

@Injectable()
export class AuthQueryService {
    constructor(
        private readonly userReader: UserReader,
        private readonly betterAuth: BetterAuthService
    ) {}

    async getClaimsByRequest(request: Request): Promise<AuthClaims | null> {
        const session = await this.betterAuth.getSession(request);

        if (!session) {
            return null;
        }

        if (session.user.isAnonymous) {
            return null;
        }

        return {
            role: session.user.role,
            sessionId: session.session.id,
            status: session.user.status,
            userId: parseUserId(session.user.id)
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getUser(userId: number): Promise<User> {
        const user = await this.userReader.findById(userId);

        if (!user) {
            throw new AppError("NOT_FOUND", "User not found.", 404);
        }

        return UserAccountDomain.toUser(user);
    }
}

function parseUserId(value: string | number): number {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError("INVALID_AUTH_USER", "Authentication provider returned an invalid user.", 500);
    }

    return id;
}
