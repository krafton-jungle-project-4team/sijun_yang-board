import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

export function loadEnvFile() {
    const candidates = [resolve(process.cwd(), "apps/api-server/.env"), resolve(process.cwd(), ".env")];
    const envFile = candidates.find((candidate) => existsSync(candidate));

    if (envFile) {
        config({ path: envFile });
    }
}
