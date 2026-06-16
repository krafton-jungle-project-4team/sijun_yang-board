import "reflect-metadata";

import { randomUUID } from "node:crypto";

import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";

import { AppModule } from "./app.module";
import { serverEnv } from "./infra/env";
import { ApiExceptionFilter, ApiResponseInterceptor } from "./infra/http";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.use((request: Request & { requestId?: string }, response: Response, next: NextFunction) => {
        const requestId = request.header("x-request-id") ?? randomUUID();

        request.requestId = requestId;
        response.setHeader("x-request-id", requestId);
        next();
    });

    app.setGlobalPrefix("api");
    app.enableCors({
        origin: serverEnv.WEB_ORIGIN,
        credentials: true
    });
    app.useGlobalFilters(new ApiExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());

    await app.listen(serverEnv.PORT);
}

void bootstrap();
