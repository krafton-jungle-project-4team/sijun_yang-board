import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(scriptDir, "..");
const repoRoot = resolve(apiRoot, "../..");
const composeFile = resolve(repoRoot, "compose.yml");
const envFile = resolve(apiRoot, ".env");
const postgresVolume = `${process.env.COMPOSE_PROJECT_NAME ?? "namanmu"}_postgres-data`;

const run = (args, options = {}) => {
    const result = spawnSync("docker", args, {
        encoding: "utf8",
        ...options
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(result.stderr.trim() || "docker command failed");
    }

    return result.stdout.trim();
};

const composeArgs = (...args) => [
    "compose",
    "--project-directory",
    repoRoot,
    "--file",
    composeFile,
    "--env-file",
    envFile,
    ...args
];

try {
    if (!existsSync(envFile)) {
        throw new Error(`missing ${envFile}`);
    }

    console.log("db:forcesync recreates the local PostgreSQL volume from schema.sql and dummy-data.sql.");
    console.log("db:forcesync will delete local database data.");

    run(composeArgs("down", "--remove-orphans"));

    const volumeRemoval = spawnSync("docker", ["volume", "rm", postgresVolume], {
        encoding: "utf8"
    });

    if (volumeRemoval.status !== 0 && !volumeRemoval.stderr.includes("No such volume")) {
        throw new Error(volumeRemoval.stderr.trim() || "failed to remove PostgreSQL volume");
    }

    run(composeArgs("up", "--wait", "postgres"));

    console.log("db:forcesync passed");
} catch (error) {
    console.error(`db:forcesync failed: ${error.message}`);
    process.exitCode = 1;
}
