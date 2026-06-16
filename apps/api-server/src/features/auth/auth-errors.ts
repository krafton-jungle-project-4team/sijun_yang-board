import { AppError } from "../../app-errors";

export function unauthenticatedError() {
    return new AppError("UNAUTHENTICATED", "A valid session is required.", 401);
}

export function suspendedAccountError() {
    return new AppError("ACCOUNT_SUSPENDED", "This account is suspended.", 403);
}

export function activeAccountRequiredError() {
    return new AppError("ACTIVE_ACCOUNT_REQUIRED", "Complete signup before this action.", 403);
}
