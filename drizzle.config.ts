import { type Config } from "drizzle-kit";



export default {
  schema: "./app/db/schema.server.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  tablesFilter: ["splitbox_*"],
} satisfies Config;


