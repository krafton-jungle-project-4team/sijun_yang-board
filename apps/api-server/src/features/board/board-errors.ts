import { AppError } from "@/app-errors";

export function postNotFoundError() {
    return new AppError("NOT_FOUND", "Post not found.", 404);
}

export function commentNotFoundError() {
    return new AppError("NOT_FOUND", "Comment not found.", 404);
}

export function boardMutationForbiddenError() {
    return new AppError("FORBIDDEN", "Only the author or an admin can change this item.", 403);
}
