import type { User } from "@nmm/shared";

import type { IGetUserByIdResult } from "./database/__generated__/auth.queries";

export function toUserModel(user: IGetUserByIdResult): User {
    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role as User["role"],
        status: user.status as User["status"],
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
    };
}
