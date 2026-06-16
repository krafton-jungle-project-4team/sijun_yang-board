import { Module } from "@nestjs/common";
import { ClsPluginTransactional } from "@nestjs-cls/transactional";
import { ClsModule } from "nestjs-cls";
import { LoggerModule } from "nestjs-pino";

import { AuthModule } from "./features/auth";
import { BoardModule } from "./features/board";
import { HealthModule } from "./features/health/health.module";
import { OperationsModule } from "./features/operations";
import { DatabaseModule, PgTypedTransactionalAdapter } from "./infra/database";
import { serverEnv } from "./infra/env";

@Module({
    imports: [
        LoggerModule.forRoot({
            pinoHttp: {
                level: serverEnv.LOG_LEVEL
            }
        }),
        DatabaseModule,
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true
            },
            plugins: [
                new ClsPluginTransactional({
                    imports: [DatabaseModule],
                    adapter: new PgTypedTransactionalAdapter(),
                    enableTransactionProxy: true
                })
            ]
        }),
        AuthModule,
        BoardModule,
        OperationsModule,
        HealthModule
    ]
})
export class AppModule {}
