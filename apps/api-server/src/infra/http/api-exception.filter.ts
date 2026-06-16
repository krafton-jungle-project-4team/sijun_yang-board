import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import type { Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../../app-errors";
import type { RequestWithRequestId } from "./api-response";

type ErrorBody = {
    code: string;
    message: string;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    catch(error: unknown, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const request = context.getRequest<Request & RequestWithRequestId>();
        const response = context.getResponse<Response>();
        const requestId = request.requestId ?? "missing-request-id";
        const status = this.getStatus(error);
        const body = this.getBody(error);

        response.status(status).json({
            requestId,
            error: body
        });
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

    private getBody(error: unknown): ErrorBody {
        if (error instanceof AppError) {
            return {
                code: error.code,
                message: error.message
            };
        }

        if (error instanceof ZodError) {
            return {
                code: "VALIDATION_FAILED",
                message: error.issues.map((issue) => issue.message).join(", ")
            };
        }

        if (error instanceof HttpException) {
            return {
                code: "HTTP_ERROR",
                message: error.message
            };
        }

        return {
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected server error."
        };
    }
}
