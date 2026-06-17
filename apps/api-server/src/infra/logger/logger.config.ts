import type { IncomingMessage, ServerResponse } from "node:http";

import type { Params } from "nestjs-pino";

import { REQUEST_ID_HEADER, ensureRequestId, type RequestWithRequestId } from "@/infra/http";
import { serverEnv } from "@/infra/env";

const SERVICE_NAME = "nmm-api-server";
const REDACTED = "[Redacted]";

export const loggerModuleOptions = {
    assignResponse: true,
    pinoHttp: {
        level: serverEnv.LOG_LEVEL,
        messageKey: "message",
        quietReqLogger: true,
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        genReqId: createRequestId,
        customAttributeKeys: {
            req: "request",
            res: "response",
            err: "error",
            reqId: "requestId",
            responseTime: "durationMs"
        },
        customProps(request) {
            return {
                requestId: getLoggableRequestId(request)
            };
        },
        customLogLevel(_request, response, error) {
            if (error || response.statusCode >= 500) {
                return "error";
            }

            if (response.statusCode >= 400) {
                return "warn";
            }

            return "info";
        },
        customSuccessMessage(request, response) {
            return `${getRequestLine(request)} completed with ${response.statusCode}`;
        },
        customErrorMessage(request, response) {
            return `${getRequestLine(request)} failed with ${response.statusCode}`;
        },
        formatters: {
            level(label) {
                return { level: label };
            },
            bindings(bindings) {
                return {
                    pid: bindings.pid,
                    hostname: bindings.hostname,
                    service: SERVICE_NAME,
                    env: serverEnv.NODE_ENV
                };
            }
        },
        redact: {
            paths: [
                "request.headers.authorization",
                "request.headers.cookie",
                "request.headers.set-cookie",
                "response.headers.set-cookie"
            ],
            censor: REDACTED
        }
    }
} satisfies Params;

function createRequestId(request: IncomingMessage, response: ServerResponse) {
    const requestId = ensureRequestId(request as RequestWithRequestId);

    response.setHeader(REQUEST_ID_HEADER, requestId);
    return requestId;
}

function getLoggableRequestId(request: IncomingMessage) {
    const requestId = request.id;

    if (typeof requestId === "string" || typeof requestId === "number") {
        return String(requestId);
    }

    return undefined;
}

function getRequestLine(request: IncomingMessage) {
    return `${request.method ?? "REQUEST"} ${request.url ?? ""}`.trim();
}
