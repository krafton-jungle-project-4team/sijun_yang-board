import { Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Pool } from "pg";

import { databaseConfig } from "./database.config";
import { PG_POOL } from "./database.tokens";

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
