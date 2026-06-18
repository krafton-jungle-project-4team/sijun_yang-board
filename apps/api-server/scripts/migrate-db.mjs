import { connection, runSqldef } from "./schema-sync-utils.mjs";

const dryRun = process.argv.includes("--dry-run");
const commandName = dryRun ? "db:migrate:plan" : "db:migrate";
const sqldefMode = dryRun ? "--dry-run" : "--apply";

try {
    const result = runSqldef(connection(), [sqldefMode]);

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(result.stderr.trim() || "sqldef command failed");
    }

    if (result.stdout.trim()) {
        console.log(result.stdout.trim());
    }

    console.log(`${commandName} passed`);
} catch (error) {
    console.error(`${commandName} failed: ${error.message}`);
    process.exitCode = 1;
}
