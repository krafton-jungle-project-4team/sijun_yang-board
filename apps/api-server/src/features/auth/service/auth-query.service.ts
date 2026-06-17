import type { User } from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { PinoLogger } from "nestjs-pino";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { assignLoggerContext } from "@/infra/logger";
import { invalidAuthUserError, suspendedAccountError, userNotFoundError } from "@/features/auth/auth-errors";
import { UserAccountDomain, type AuthClaims, type UserAccountSnapshot } from "@/features/auth/domain";
import { BetterAuthProvider } from "@/features/auth/provider";
import { UserReader } from "@/features/auth/repository";

@Injectable()
export class AuthQueryService {
    constructor(
        private readonly userReader: UserReader,
        private readonly betterAuth: BetterAuthProvider,
        private readonly logger: PinoLogger
    ) {}

    async getClaimsByRequest(request: Request): Promise<AuthClaims | null> {
        const session = await this.betterAuth.getSession(request);

        if (!session) {
            return null;
        }

        if (session.user.isAnonymous) {
            return null;
        }

        const claims = {
            role: session.user.role,
            sessionId: session.session.id,
            userId: parseUserId(session.user.id)
        };

        assignLoggerContext(this.logger, {
            sessionId: claims.sessionId,
            userId: claims.userId
        });

        return claims;
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getUser(userId: number): Promise<User> {
        const user = await this.getAccount(userId);

        return UserAccountDomain.toUser(user);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getActiveUser(userId: number): Promise<User> {
        const user = await this.getAccount(userId);

        assertActiveUser(user);

        return UserAccountDomain.toUser(user);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async assertActiveUser(userId: number): Promise<void> {
        const user = await this.getAccount(userId);

        assertActiveUser(user);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async hasActiveUser(userId: number): Promise<boolean> {
        const user = await this.userReader.findById(userId);

        return Boolean(user && user.status !== "SUSPENDED");
    }

    private async getAccount(userId: number): Promise<UserAccountSnapshot> {
        const user = await this.userReader.findById(userId);

        if (!user) {
            throw userNotFoundError();
        }

        return user;
    }
}

function assertActiveUser(user: UserAccountSnapshot) {
    if (user.status === "SUSPENDED") {
        throw suspendedAccountError();
    }
}

function parseUserId(value: string | number): number {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw invalidAuthUserError();
    }

    return id;
}
