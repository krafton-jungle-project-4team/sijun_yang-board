import type { AuthClaims, UserRole, UserStatus } from "@nmm/shared";

export interface AuthSession {
    id: string;
    userId: number;
}

export interface SessionClaims {
    id: string;
    userId: number;
    role: UserRole;
    status: UserStatus;
}

export const SessionDomain = {
    toAuthClaims(session: SessionClaims): AuthClaims {
        return {
            userId: session.userId,
            sessionId: session.id,
            role: session.role,
            status: session.status
        };
    }
};
