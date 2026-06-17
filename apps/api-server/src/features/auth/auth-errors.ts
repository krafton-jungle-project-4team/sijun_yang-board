import { HttpStatus } from "@nestjs/common";

import { createDomainError, type DomainErrorDefinition } from "@/app-errors";

export const AUTH_ERRORS = {
    UNAUTHENTICATED: {
        statusCode: HttpStatus.UNAUTHORIZED,
        code: "AUTH_UNAUTHENTICATED",
        message: "로그인이 필요합니다."
    },
    ACCOUNT_ALREADY_EXISTS: {
        statusCode: HttpStatus.CONFLICT,
        code: "AUTH_ACCOUNT_ALREADY_EXISTS",
        message: "이미 사용 중인 아이디 또는 이메일입니다."
    },
    ACCOUNT_SUSPENDED: {
        statusCode: HttpStatus.FORBIDDEN,
        code: "AUTH_ACCOUNT_SUSPENDED",
        message: "정지된 계정입니다."
    },
    USER_NOT_FOUND: {
        statusCode: HttpStatus.NOT_FOUND,
        code: "AUTH_USER_NOT_FOUND",
        message: "사용자를 찾을 수 없습니다."
    },
    INVALID_USER: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "AUTH_INVALID_USER",
        message: "인증 제공자가 올바르지 않은 사용자 정보를 반환했습니다."
    },
    INVALID_CREDENTIALS: {
        statusCode: HttpStatus.UNAUTHORIZED,
        code: "AUTH_INVALID_CREDENTIALS",
        message: "아이디 또는 비밀번호가 올바르지 않습니다."
    },
    PROVIDER_ERROR: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "AUTH_PROVIDER_ERROR",
        message: "인증 요청에 실패했습니다."
    }
} as const;

export function createAuthError(error: DomainErrorDefinition, options?: ErrorOptions) {
    return createDomainError(error, options);
}

export function unauthenticatedError() {
    return createAuthError(AUTH_ERRORS.UNAUTHENTICATED);
}

export function accountAlreadyExistsError() {
    return createAuthError(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS);
}

export function suspendedAccountError() {
    return createAuthError(AUTH_ERRORS.ACCOUNT_SUSPENDED);
}

export function userNotFoundError() {
    return createAuthError(AUTH_ERRORS.USER_NOT_FOUND);
}

export function invalidAuthUserError() {
    return createAuthError(AUTH_ERRORS.INVALID_USER);
}

export function invalidCredentialsError(cause: unknown) {
    return createAuthError(AUTH_ERRORS.INVALID_CREDENTIALS, { cause });
}

export function authProviderError(message: string, statusCode: number) {
    return createAuthError({
        ...AUTH_ERRORS.PROVIDER_ERROR,
        statusCode,
        message
    });
}
