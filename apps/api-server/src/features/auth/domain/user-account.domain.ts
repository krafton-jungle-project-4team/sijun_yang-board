import type { User, UserRole, UserStatus } from "@nmm/shared";

export interface UserAccountSnapshot {
    id: number;
    email: string;
    displayName: string;
    role: UserRole;
    status: UserStatus;
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
            status: user.status,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        };
    }
};
