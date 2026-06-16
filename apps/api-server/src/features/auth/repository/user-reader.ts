import type { UserRole, UserStatus } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import {
    getClaimsBySessionId,
    getLoginCredentialsByLoginId,
    getUserById
} from "../database/__generated__/auth.queries";
import type { LoginCredentials, SessionClaims, UserAccountSnapshot } from "../domain";

@Injectable()
export class UserReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async findClaimsBySessionId(sessionId: string): Promise<SessionClaims | null> {
        const claims = await this.db.query(getClaimsBySessionId, { sessionId }).singleOrNull();

        return claims
            ? {
                  id: claims.id,
                  userId: claims.userId,
                  role: claims.role as UserRole,
                  status: claims.status as UserStatus
              }
            : null;
    }

    async findById(userId: number): Promise<UserAccountSnapshot | null> {
        const user = await this.db.query(getUserById, { userId }).singleOrNull();

        return user
            ? {
                  id: user.id,
                  email: user.email,
                  displayName: user.displayName,
                  role: user.role as UserRole,
                  status: user.status as UserStatus,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt
              }
            : null;
    }

    async findCredentialsByLoginId(loginId: string): Promise<LoginCredentials | null> {
        const credentials = await this.db.query(getLoginCredentialsByLoginId, { loginId }).singleOrNull();

        return credentials
            ? {
                  id: credentials.id,
                  passwordHash: credentials.passwordHash,
                  role: credentials.role as UserRole,
                  status: credentials.status as UserStatus
              }
            : null;
    }
}
