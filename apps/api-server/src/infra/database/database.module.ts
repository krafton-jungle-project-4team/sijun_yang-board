import { Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Pool } from "pg";

import { databaseConfig } from "./database.config";
import { PG_POOL } from "./database.tokens";

/**
 * repository가 공유하는 PostgreSQL pool을 제공하고 종료 시 닫는다.
 *
 * PgTyped transaction adapter나 직접 pool token이 필요한 곳에서 가져다 쓴다.
 * 연결 설정이 검증된 database config와 함께 유지되도록 pool 생성은 여기에서만 한다.
 */
@Module({
    providers: [
        {
            provide: PG_POOL,
            useFactory: () => new Pool(databaseConfig)
        }
    ],
    exports: [PG_POOL]
})
export class DatabaseModule implements OnApplicationShutdown {
    constructor(
        @Inject(PG_POOL)
        private readonly pool: Pool
    ) {}

    async onApplicationShutdown() {
        await this.pool.end();
    }
}
