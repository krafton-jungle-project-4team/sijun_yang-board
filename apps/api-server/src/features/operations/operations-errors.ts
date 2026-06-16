import { AppError } from "../../app-errors";

export function projectNotFoundError() {
    return new AppError("NOT_FOUND", "Project not found.", 404);
}

export function taskNotFoundError() {
    return new AppError("NOT_FOUND", "Task not found.", 404);
}

export function approvalRequestNotFoundError() {
    return new AppError("NOT_FOUND", "Approval request not found.", 404);
}

export function adminRequiredError() {
    return new AppError("FORBIDDEN", "Only admins can perform this operation.", 403);
}

export function taskMutationForbiddenError() {
    return new AppError("FORBIDDEN", "Only admins or the assigned user can change this task.", 403);
}

export function approvalRequestAlreadyReviewedError() {
    return new AppError("CONFLICT", "Approval request has already been reviewed.", 409);
}
