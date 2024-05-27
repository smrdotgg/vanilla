// import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.server";
import { env } from "~/api";
import { drizzle } from "drizzle-orm/libsql";
import { Client, createClient } from "@libsql/client";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: Client | undefined;
};
const conn =
  globalForDb.conn ??
  createClient({
    url: env.SQLITE_URL,
    authToken: env.SQLITE_AUTHKEY ?? undefined,
  });

// const conn = globalForDb.conn ?? postgres(url);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export function getDb({ url, authKey }: { url: string; authKey?: string }) {
  const conn =
    globalForDb.conn ??
    createClient({
      url,
      authToken: authKey,
    });
  const db = drizzle(conn, { schema });
  return {db, conn};
}

export const db = drizzle(conn, { schema });

export type DrizzleDb = typeof db;
