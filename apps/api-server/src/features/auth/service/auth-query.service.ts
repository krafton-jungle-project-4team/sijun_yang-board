import type { User } from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { PinoLogger } from "nestjs-pino";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { assignLoggerContext } from "@/infra/logger";
import { authErrors } from "@/features/auth/auth-errors";
import type { AuthClaims } from "@/features/auth/domain";
import { BetterAuthProvider } from "@/features/auth/provider";
import { UserReader } from "@/features/auth/repository";

/**
 * 인증된 request claims와 user read model을 해석한다.
 *
 * guard, controller, 다른 feature가 session에서 나온 user identity를 필요로 할 때 사용한다.
 * read는 transaction 범위 안에 두고 application claims를 만들기 전에 provider id의 유효성을 검증한다.
 */
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
        const user = await this.userReader.findById(userId);

        if (!user) {
            throw authErrors.userNotFound();
        }

        return user;
    }
}

function parseUserId(value: string | number): number {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw authErrors.invalidUser();
    }

    return id;
}
