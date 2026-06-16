import type { UserRole, UserStatus } from "@nmm/shared";

export interface LoginCredentials {
    id: number;
    passwordHash: string;
    role: UserRole;
    status: UserStatus;
}

export const LoginCredentialsDomain = {
    isSuspended(credentials: LoginCredentials) {
        return credentials.status === "SUSPENDED";
    }
};
