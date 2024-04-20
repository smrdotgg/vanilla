import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
require('dotenv').config()

export const env = createEnv({
  server: {
    // shared for dev and prod
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    RESEND_API: z.string(),
    // different for dev and prod
    // namecheap
    NAMECHEAP_API_KEY: z.string(),
    NAMECHEAP_API_URL: z.string().url(),
    // pg
    POSTGRES_USER:z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_URL: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_DB: z.string(),
    VERCEL_URL: z.string().nullish(),
    NODE_ENV: z.enum(['development', 'production']),
  },
 
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",
 
  client: {
    // url
    PUBLIC_URL: z.string().url(),
  },
 
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,
 
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
