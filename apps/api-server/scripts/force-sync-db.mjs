import { connection, runPsql, runSqldef } from "./schema-sync-utils.mjs";

try {
    const db = connection();

    console.log("db:forcesync applies schema.sql with sqldef --apply --enable-drop.");
    console.log("db:forcesync may drop PostgreSQL schema objects and clears sessions.");

    runPsql(
        db,
        `DROP TABLE IF EXISTS "session", sessions CASCADE;
`
    );

    const result = runSqldef(db, ["--apply", "--enable-drop"]);

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(result.stderr.trim() || "sqldef command failed");
    }

    if (result.stdout.trim()) {
        console.log(result.stdout.trim());
    }

    console.log("db:forcesync passed");
} catch (error) {
    console.error(`db:forcesync failed: ${error.message}`);
    process.exitCode = 1;
}
