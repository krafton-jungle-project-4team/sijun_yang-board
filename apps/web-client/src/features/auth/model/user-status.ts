import type { User } from "@nmm/shared";

export type ActiveUser = User & { status: "ACTIVE" };

export function isActiveUser(user: User | null | undefined): user is ActiveUser {
    return user?.status === "ACTIVE";
}

export function needsSignup(user: User | null | undefined) {
    return user?.status === "PENDING";
}
