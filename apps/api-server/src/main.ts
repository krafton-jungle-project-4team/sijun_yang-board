import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";
import { serverEnv } from "./infra/env";
import { ApiExceptionFilter, ApiResponseInterceptor, ensureRequestId, setRequestIdHeader } from "./infra/http";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.useLogger(app.get(Logger));

    app.use((request: Request, response: Response, next: NextFunction) => {
        const requestId = ensureRequestId(request);

        setRequestIdHeader(response, requestId);
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
