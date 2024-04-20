import { type Config } from "drizzle-kit";
import { env } from "~/api";

const url = `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_URL}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;

export default {
  schema: "./app/db/schema.server.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: url,
  },
  tablesFilter: ["rs_*"],
} satisfies Config;
