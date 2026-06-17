import type { User } from "@nmm/shared";

export function isSignedInUser(user: User | null | undefined): user is User {
    return user !== null && user !== undefined;
}
