import type { AuthClaims, User } from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { AppError } from "../../../app-errors";
import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { SessionDomain, UserAccountDomain } from "../domain";
import { UserReader } from "../repository";

@Injectable()
export class AuthQueryService {
    constructor(private readonly userReader: UserReader) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async getClaimsBySessionId(sessionId: string): Promise<AuthClaims | null> {
        const session = await this.userReader.findClaimsBySessionId(sessionId);

        return session ? SessionDomain.toAuthClaims(session) : null;
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
