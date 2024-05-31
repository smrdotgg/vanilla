import { Database } from "bun:sqlite";
import { promises as fs } from "fs";
import * as path from "path";
import { env } from "~/api";

async function applyMigrations() {
  const debugMode = env.DEBUG_LOGS;

  const simpleLog = (message: string) => console.log(`[INFO] ${message}`);
  const debugLog = (message: string) =>
    debugMode &&
    console.debug(`[MIGRATION] ${new Date().toISOString()} ${message}`);

  simpleLog("Connecting to the database...");
  // Connect to the database
  const urlWithoutPrefix = env.SQLITE_URL;//.split(":").at(-1);
  console.log(`URL without prefix: ${urlWithoutPrefix}`);
  const db = new Database(urlWithoutPrefix);
  simpleLog(`Connected to the database successfully!`);
  simpleLog(env.SQLITE_URL);
  

  simpleLog("Ensuring migrations table exists...");
  db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  simpleLog("Migrations table ensured!");

  const migrationsPath = path.resolve(env.MIGRATIONS_FOLDER);
  simpleLog(`Migrations path: ${migrationsPath}`);

  simpleLog("Listing migration files...");
  const migrationFiles = (await fs.readdir(migrationsPath))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  debugLog(`Migration files found: ${migrationFiles.join(", ")}`);

  debugLog("Fetching applied migrations...");
  const appliedMigrations = db.query("SELECT name FROM migrations").all();
  const appliedMigrationsSet = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (appliedMigrations as any).map((row: { name: string }) => row.name),
  );
  debugLog(`Applied migrations: ${JSON.stringify(appliedMigrationsSet)}`);

  const pendingMigrations = migrationFiles.filter(
    (migration) => !appliedMigrationsSet.has(migration),
  );
  debugLog(`Pending migrations: ${JSON.stringify(pendingMigrations)}`);

  debugLog("Applying pending migrations...");
  for (const migration of pendingMigrations) {
    simpleLog(`Applying migration: ${migration}`);
    const sql = await fs.readFile(
      path.join(migrationsPath, migration),
      "utf-8",
    );
    try {
      db.exec(sql);
    } catch (e) {
      // sql line was probably wrong
      console.error(`Error applying migration: ${sql} `);
      throw e;
    }
    db.run("INSERT INTO migrations (name) VALUES (?)", [migration]);
    simpleLog(`Migration ${migration} applied successfully!`);
  }

  db.close();
  simpleLog("Database connection closed!");
}

applyMigrations().catch((err) => {
  console.error(err);
});
