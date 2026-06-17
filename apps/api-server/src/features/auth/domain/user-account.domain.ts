import type { User, UserRole } from "@nmm/shared";

export interface AuthClaims {
    userId: number;
    sessionId: string;
    role: UserRole;
}

export interface UserAccountSnapshot {
    id: number;
    email: string;
    displayName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export const UserAccountDomain = {
    toUser(user: UserAccountSnapshot): User {
        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        };
    }
};
