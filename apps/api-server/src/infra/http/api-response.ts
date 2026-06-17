import { randomUUID } from "node:crypto";

import type { ApiError, ApiFailure, ApiSuccess } from "@nmm/shared";
import type { Request, Response } from "express";

export const REQUEST_ID_HEADER = "x-request-id";

export type RequestWithRequestId = Request & {
    requestId?: string;
};

export function ensureRequestId(request: RequestWithRequestId) {
    const requestId = request.requestId || request.header(REQUEST_ID_HEADER) || randomUUID();

    request.requestId = requestId;
    return requestId;
}

export function setRequestIdHeader(response: Response, requestId: string) {
    response.setHeader(REQUEST_ID_HEADER, requestId);
}

export function createApiSuccess<TData>(requestId: string, data: TData): ApiSuccess<TData> {
    return {
        requestId,
        data
    };
}

export function createApiFailure(requestId: string, error: ApiError): ApiFailure {
    return {
        requestId,
        error
    };
}
