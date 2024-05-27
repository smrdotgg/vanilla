import type { Config } from "drizzle-kit";
import { env } from "~/api";

export default {
  schema: "./app/db/schema.server.ts",
  driver: "turso",
  dialect: "sqlite",
  dbCredentials: {
    url: env.SQLITE_URL,
    authToken: env.SQLITE_AUTHKEY ?? undefined,
  },
} satisfies Config;
