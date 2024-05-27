// import { Database } from "bun:sqlite";
import { sql } from "drizzle-orm";
import { promises as fs } from "fs";
import * as path from "path";
import { env } from "~/api";
import { getDb } from "~/db/index.server";

async function applyMigrations() {
  const debugMode = env.DEBUG_LOGS;

  const simpleLog = (message: string) => console.log(`[INFO] ${message}`);
  const debugLog = (message: string) =>
    debugMode &&
    console.debug(`[MIGRATION] ${new Date().toISOString()} ${message}`);

  simpleLog("Connecting to the database...");

  let parsedUrl = env.SQLITE_URL;
  if (parsedUrl.startsWith("file")){
    parsedUrl = parsedUrl.split(":").at(-1)!;
  }
  const { conn } = getDb({
    url: parsedUrl,
    authKey: env.SQLITE_AUTHKEY ?? undefined,
  });
  // conn.execute
  simpleLog(`URL without prefix: ${parsedUrl}`);
  // const db = new Database(urlWithoutPrefix);
  simpleLog(`Connected to the database successfully!`);
  simpleLog(env.SQLITE_URL);

  simpleLog("Ensuring migrations table exists...");
  await conn.execute(
    `
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `,
  );
  simpleLog("Migrations table ensured!");

  const migrationsPath = path.resolve(env.MIGRATIONS_FOLDER);
  simpleLog(`Migrations path: ${migrationsPath}`);

  simpleLog("Listing migration files...");
  const migrationFiles = (await fs.readdir(migrationsPath))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  debugLog(`Migration files found: ${migrationFiles.join(", ")}`);

  debugLog("Fetching applied migrations...");
  const appliedMigrations = await conn.execute(`SELECT name FROM migrations`); //.all();
  debugLog(`Applied migrations: ${JSON.stringify(appliedMigrations)}`);
  const appliedMigrationsSet = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (appliedMigrations as any).rows.map((row: { name: string }) => row.name),
  );
  debugLog(`Applied migrations: ${JSON.stringify(appliedMigrationsSet)}`);

  const pendingMigrations = migrationFiles.filter(
    (migration) => !appliedMigrationsSet.has(migration),
  );
  debugLog(`Pending migrations: ${JSON.stringify(pendingMigrations)}`);

  debugLog("Applying pending migrations...");
  for (const migration of pendingMigrations) {
    simpleLog(`Applying migration: ${migration}`);
    const sqlCommand = await fs.readFile(
      path.join(migrationsPath, migration),
      "utf-8",
    );
    let line = "";
    try {
      // await conn.execute(sqlCommand);
      for (const l of sqlCommand.split(";")) {
        if (l.trim() === "") continue;
        line = l + ";";
        await conn.execute(line);
      }
    } catch (e) {
      // sql line was probably wrong
      console.error(`Error applying migration: ${line} `);
      process.exit(1);
      // throw e;
    }
    await conn.execute({
      sql: "INSERT INTO migrations (name) VALUES (?)",
      args: [migration],
    });
    simpleLog(`Migration ${migration} applied successfully!`);
  }
  simpleLog("Database connection closed!");
}

applyMigrations().catch((err) => {
  console.error(err);
});
