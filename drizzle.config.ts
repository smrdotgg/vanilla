import { type Config } from "drizzle-kit";
import { env } from "~/api";

// const url = `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_URL}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;

const url = env.SQLITE_URL;

export default {
  schema: "./app/db/schema.server.ts",
  driver: "turso",
  dialect: "sqlite",
  dbCredentials: {
    url: url,
    // dbName: "guided-ghost",
    authToken: env.SQLITE_AUTHKEY ?? undefined,
  },
  // tablesFilter: ["rs_*"],
} satisfies Config;
