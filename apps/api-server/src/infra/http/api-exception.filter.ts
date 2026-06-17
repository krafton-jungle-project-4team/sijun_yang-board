import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { ApiError } from "@nmm/shared";
import type { Response } from "express";
import { ZodError } from "zod";

import { AppError } from "@/app-errors";
import { createApiFailure, ensureRequestId, setRequestIdHeader, type RequestWithRequestId } from "./api-response";

/**
 * 던져진 오류를 공유 API 실패 envelope와 구조화 로그로 변환한다.
 *
 * controller와 interceptor를 감싸는 전역 HTTP exception 경계로 사용한다.
 * status와 message 매핑을 여기로 모아 controller가 응답을 직접 만들지 않고 domain error를 던지게 한다.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ApiExceptionFilter.name);

    catch(error: unknown, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const request = context.getRequest<RequestWithRequestId>();
        const response = context.getResponse<Response>();
        const requestId = ensureRequestId(request);
        const status = this.getStatus(error);
        const body = this.getBody(error, status);

        this.logFailure(request, requestId, status, body, error);

        const failure = createApiFailure(requestId, body);
        setRequestIdHeader(response, requestId);
        response.status(status).json(failure);
    }

    private logFailure(
        request: RequestWithRequestId,
        requestId: string,
        statusCode: number,
        body: ApiError,
        error: unknown
    ) {
        const details: ErrorResponseLog = {
            requestId,
            statusCode,
            code: body.code,
            method: request.method,
            path: request.originalUrl || request.url,
            errorMessage: getLogMessage(body.message, error)
        };

        if (statusCode >= 500) {
            details.stack = getErrorStack(error);
            this.logger.error(details, "Returning error response");
            return;
        }

        this.logger.warn(details, "Returning error response");
    }

    private getStatus(error: unknown) {
        if (error instanceof AppError) {
            return error.statusCode;
        }

        if (error instanceof ZodError) {
            return 400;
        }

        if (error instanceof HttpException) {
            return error.getStatus();
        }

        return 500;
    }

    private getBody(error: unknown, statusCode: number): ApiError {
        if (error instanceof AppError) {
            return {
                statusCode,
                code: error.code,
                message: error.message
            };
        }

        if (error instanceof ZodError) {
            return {
                statusCode,
                code: "VALIDATION_FAILED",
                message: error.issues.map((issue) => issue.message).join(", ")
            };
        }

        if (error instanceof HttpException) {
            return {
                statusCode,
                code: getHttpErrorCode(error),
                message: getHttpErrorMessage(error, statusCode)
            };
        }

        return {
            statusCode,
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected server error."
        };
    }
}

type ErrorResponseLog = {
    requestId: string;
    statusCode: number;
    code: string;
    method: string;
    path: string;
    errorMessage: string;
    stack?: string;
};

function getHttpErrorCode(error: HttpException) {
    const body = error.getResponse();

    if (isRecord(body) && typeof body.code === "string" && body.code.length > 0) {
        return body.code;
    }

    return httpStatusErrorCodes[error.getStatus()] ?? "HTTP_ERROR";
}

function getHttpErrorMessage(error: HttpException, status: number) {
    const body = error.getResponse();

    if (typeof body === "string" && body.length > 0) {
        return body;
    }

    if (isRecord(body) && typeof body.message === "string" && body.message.length > 0) {
        return body.message;
    }

    if (isRecord(body) && Array.isArray(body.message) && body.message.every((message) => typeof message === "string")) {
        return body.message.join(", ");
    }

    return error.message || httpStatusErrorMessages[status] || "HTTP error.";
}

function getLogMessage(message: string, error: unknown) {
    if (error instanceof Error && error.cause instanceof Error) {
        return `${message}: ${error.cause.message}`;
    }

    return message;
}

function getErrorStack(error: unknown) {
    if (error instanceof Error) {
        return error.stack;
    }

    return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

const httpStatusErrorCodes: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHENTICATED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT"
};

const httpStatusErrorMessages: Record<number, string> = {
    400: "Bad request.",
    401: "Authentication is required.",
    403: "Forbidden.",
    404: "Not found.",
    409: "Conflict."
};
