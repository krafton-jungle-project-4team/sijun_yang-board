import { HttpStatus } from "@nestjs/common";

import { createDomainError } from "@/app-errors";

export const OPERATIONS_ERRORS = {
    PROJECT_NOT_FOUND: {
        statusCode: HttpStatus.NOT_FOUND,
        code: "OPERATIONS_PROJECT_NOT_FOUND",
        message: "프로젝트를 찾을 수 없습니다."
    },
    TASK_NOT_FOUND: {
        statusCode: HttpStatus.NOT_FOUND,
        code: "OPERATIONS_TASK_NOT_FOUND",
        message: "작업을 찾을 수 없습니다."
    },
    APPROVAL_REQUEST_NOT_FOUND: {
        statusCode: HttpStatus.NOT_FOUND,
        code: "OPERATIONS_APPROVAL_REQUEST_NOT_FOUND",
        message: "승인 요청을 찾을 수 없습니다."
    },
    ADMIN_REQUIRED: {
        statusCode: HttpStatus.FORBIDDEN,
        code: "OPERATIONS_ADMIN_REQUIRED",
        message: "관리자만 수행할 수 있는 작업입니다."
    },
    TASK_FORBIDDEN: {
        statusCode: HttpStatus.FORBIDDEN,
        code: "OPERATIONS_TASK_FORBIDDEN",
        message: "관리자 또는 담당자만 이 작업을 변경할 수 있습니다."
    },
    APPROVAL_REQUEST_ALREADY_REVIEWED: {
        statusCode: HttpStatus.CONFLICT,
        code: "OPERATIONS_APPROVAL_REQUEST_ALREADY_REVIEWED",
        message: "이미 검토된 승인 요청입니다."
    }
} as const;

export function createOperationsError(error: (typeof OPERATIONS_ERRORS)[keyof typeof OPERATIONS_ERRORS]) {
    return createDomainError(error);
}

export const operationsErrors = {
    projectNotFound: () => createOperationsError(OPERATIONS_ERRORS.PROJECT_NOT_FOUND),
    taskNotFound: () => createOperationsError(OPERATIONS_ERRORS.TASK_NOT_FOUND),
    approvalRequestNotFound: () => createOperationsError(OPERATIONS_ERRORS.APPROVAL_REQUEST_NOT_FOUND),
    adminRequired: () => createOperationsError(OPERATIONS_ERRORS.ADMIN_REQUIRED),
    taskMutationForbidden: () => createOperationsError(OPERATIONS_ERRORS.TASK_FORBIDDEN),
    approvalRequestAlreadyReviewed: () => createOperationsError(OPERATIONS_ERRORS.APPROVAL_REQUEST_ALREADY_REVIEWED)
} as const;
