import { Module } from "@nestjs/common";
import { ClsPluginTransactional } from "@nestjs-cls/transactional";
import { ClsModule } from "nestjs-cls";
import { LoggerModule } from "nestjs-pino";

import { AuthModule } from "./features/auth";
import { BoardModule } from "./features/board";
import { HealthModule } from "./features/health/health.module";
import { OperationsModule } from "./features/operations";
import { DatabaseModule, PgTypedTransactionalAdapter } from "./infra/database";
import { loggerModuleOptions } from "./infra/logger";

/**
 * API 서버의 루트 Nest module과 공통 인프라 구성을 묶는다.
 *
 * logger, CLS transaction, database, feature module을 연결하는 애플리케이션 bootstrap 경계로만 사용한다.
 * 기능 유스케이스는 각 feature module에 두어 이 클래스에 비즈니스 로직이 쌓이지 않게 한다.
 */
@Module({
    imports: [
        LoggerModule.forRoot(loggerModuleOptions),
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
