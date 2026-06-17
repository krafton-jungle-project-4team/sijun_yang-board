import { AppError } from "@/app-errors";

export function unauthenticatedError() {
    return new AppError("UNAUTHENTICATED", "A valid session is required.", 401);
}

export function accountAlreadyExistsError() {
    return new AppError("ACCOUNT_ALREADY_EXISTS", "An account with this ID or email already exists.", 409);
}

export function suspendedAccountError() {
    return new AppError("ACCOUNT_SUSPENDED", "This account is suspended.", 403);
}
