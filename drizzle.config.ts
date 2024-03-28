import { type Config } from "drizzle-kit";


export default {
  schema: "./app/db/schema.server.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  tablesFilter: ["rs_*"],
} satisfies Config;



