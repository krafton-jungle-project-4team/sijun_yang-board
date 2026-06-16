import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

const workspaceRoot = resolve(import.meta.dirname, "../../..");
const envPath = resolve(workspaceRoot, "apps/api-server/.env");
const schemaPath = resolve(workspaceRoot, "apps/api-server/database/schema.sql");
const defaultSqldefImage = "sqldef/psqldef:3.11.5";
const defaultDockerHostAlias = "host.docker.internal";

if (existsSync(envPath)) {
    config({ path: envPath });
}

function firstValue(...values) {
    return values.find((value) => value !== undefined && value !== "");
}

function fail(message, detail) {
    console.error(`db:verify failed: ${message}`);

    if (detail) {
        console.error(detail);
    }

    process.exit(1);
}

const databaseName = firstValue(process.env.SQLDEF_DATABASE_NAME, process.env.POSTGRES_DB, process.env.DATABASE_NAME);
const databaseUser = firstValue(process.env.SQLDEF_DATABASE_USER, process.env.POSTGRES_USER, process.env.DATABASE_USER);
const databasePassword = firstValue(
    process.env.SQLDEF_DATABASE_PASSWORD,
    process.env.POSTGRES_PASSWORD,
    process.env.DATABASE_PASSWORD
);
const databasePort = firstValue(
    process.env.SQLDEF_DATABASE_PORT,
    process.env.POSTGRES_PORT,
    process.env.DATABASE_PORT,
    "5432"
);
const dockerNetwork = firstValue(process.env.SQLDEF_DOCKER_NETWORK);
const databaseHost = firstValue(
    process.env.SQLDEF_DATABASE_HOST,
    dockerNetwork ? process.env.DATABASE_HOST : undefined,
    dockerNetwork ? "postgres" : defaultDockerHostAlias
);
const sqldefImage = firstValue(process.env.SQLDEF_IMAGE, defaultSqldefImage);
const pgSslMode = firstValue(process.env.PGSSLMODE, "disable");

const missing = [
    [databaseName, "SQLDEF_DATABASE_NAME, POSTGRES_DB, or DATABASE_NAME"],
    [databaseUser, "SQLDEF_DATABASE_USER, POSTGRES_USER, or DATABASE_USER"],
    [databasePassword, "SQLDEF_DATABASE_PASSWORD, POSTGRES_PASSWORD, or DATABASE_PASSWORD"]
].flatMap(([value, label]) => (value ? [] : [label]));

if (missing.length > 0) {
    fail(
        `missing database environment value(s): ${missing.join("; ")}. Check apps/api-server/.env or export overrides.`
    );
}

if (!existsSync(schemaPath)) {
    fail(`schema source not found at ${schemaPath}.`);
}

const dockerInfo = spawnSync("docker", ["info"], {
    cwd: workspaceRoot,
    encoding: "utf8",
    stdio: "pipe"
});

if (dockerInfo.error?.code === "ENOENT") {
    fail("Docker CLI is not installed or not available on PATH.");
}

if (dockerInfo.error) {
    fail("Docker CLI could not be started.", dockerInfo.error.message);
}

if (dockerInfo.status !== 0) {
    fail(
        "Docker is not running or is not reachable.",
        "Start Docker Desktop or your Docker daemon, then rerun npm run db:verify."
    );
}

const dockerArgs = ["run", "--rm", "-v", `${schemaPath}:/schema.sql:ro`, "-e", "PGPASSWORD", "-e", "PGSSLMODE"];

if (dockerNetwork) {
    dockerArgs.push("--network", dockerNetwork);
} else {
    dockerArgs.push("--add-host", `${defaultDockerHostAlias}:host-gateway`);
}

dockerArgs.push(
    sqldefImage,
    "-h",
    databaseHost,
    "-p",
    databasePort,
    "-U",
    databaseUser,
    "--dry-run",
    "--enable-drop",
    "-f",
    "/schema.sql",
    databaseName
);

console.log(`Running sqldef schema drift check with ${sqldefImage}.`);
console.log(`Connecting from Docker to ${databaseHost}:${databasePort}/${databaseName}.`);

const result = spawnSync("docker", dockerArgs, {
    cwd: workspaceRoot,
    encoding: "utf8",
    env: {
        ...process.env,
        PGPASSWORD: databasePassword,
        PGSSLMODE: pgSslMode
    },
    stdio: "pipe"
});

if (result.stdout) {
    process.stdout.write(result.stdout);
}

if (result.stderr) {
    process.stderr.write(result.stderr);
}

if (result.error?.code === "ENOENT") {
    fail("Docker CLI is not installed or not available on PATH.");
}

if (result.error) {
    fail("sqldef Docker container could not be started.", result.error.message);
}

const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
const lowerOutput = output.toLowerCase();

if (result.status !== 0) {
    if (
        lowerOutput.includes("connection refused") ||
        lowerOutput.includes("could not connect") ||
        lowerOutput.includes("no route to host") ||
        lowerOutput.includes("no such host") ||
        lowerOutput.includes("name or service not known") ||
        lowerOutput.includes("timeout")
    ) {
        fail(
            "PostgreSQL is not reachable from the sqldef Docker container.",
            "Start the database first with npm run dev:db. By default db:verify connects through host.docker.internal and the published POSTGRES_PORT; set SQLDEF_DOCKER_NETWORK and SQLDEF_DATABASE_HOST to use a Compose network instead."
        );
    }

    fail(
        `sqldef Docker run failed with exit code ${result.status}.`,
        `Docker will pull ${sqldefImage} when missing and use the local image when present. Check Docker/network access or override SQLDEF_IMAGE.`
    );
}

if (output.includes("-- Nothing is modified --")) {
    console.log("db:verify passed: schema.sql matches the current PostgreSQL schema.");
    process.exit(0);
}

if (output.trim() === "") {
    fail("sqldef produced no output; expected -- Nothing is modified -- or a dry-run diff.");
}

fail("schema drift detected. sqldef dry-run output above must be empty.");
