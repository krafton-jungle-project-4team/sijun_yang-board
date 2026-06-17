import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { ApiError } from "@nmm/shared";
import type { Response } from "express";
import { ZodError } from "zod";

import { AppError } from "@/app-errors";
import { createApiFailure, ensureRequestId, setRequestIdHeader, type RequestWithRequestId } from "./api-response";

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
        const failure = createApiFailure(requestId, body);

        if (status >= 500) {
            this.logger.error(getLogMessage(body.message, error), getErrorStack(error));
        }

        setRequestIdHeader(response, requestId);
        response.status(status).json(failure);
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
