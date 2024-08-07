import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "dotenv";

const isServer = typeof process !== "undefined";

if (typeof process !== "undefined") {
  config();
}
const jsonStringSchema = z.string().refine(
  (val) => {
    try {
      // Try to parse the string as JSON and check if it's an array of strings
      const parsed = JSON.parse(val);
      return (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      );
    } catch {
      return false;
    }
  },
  {
    message: "Invalid JSON array of strings",
  }
);

export const env = createEnv({
  server: {
    DEBUG_LOGS: z.coerce.boolean().nullish(),
    MIGRATIONS_FOLDER: z.string(),

    BACKEND_URI: z.string(),
    BACKEND_PORT: z.coerce.number(),
    CLIENT_IP: z.string(),
    // shared for dev and prod
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    RESEND_API: z.string(),
    // different for dev and prod
    // namecheap
    NAMECHEAP_API_KEY: z.string(),
    NAMECHEAP_API_URL: z.string().url(),
    NAMECHEAP_API_USERNAME: z.string(),

    FIREBASE_TYPE: z.string(),
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_PRIVATE_KEY_ID: z.string(),
    FIREBASE_PRIVATE_KEY: z.string(),
    FIREBASE_CLIENT_EMAIL: z.string(),
    FIREBASE_CLIENT_ID: z.string(),
    FIREBASE_AUTH_URI: z.string(),
    FIREBASE_TOKEN_URI: z.string(),
    FIREBASE_AUTH_PROVIDER_CERT_URL: z.string(),
    FIREBASE_CLIENT_CERT_URL: z.string(),
    FIREBASE_UNIVERSAL_DOMAIN: z.string(),

    // pg
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_URL: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_DB: z.string(),
    VERCEL_URL: z.string().nullish(),
    NODE_ENV: z.enum(["development", "production"]).default("production"),

    CONTABO_CLIENT_ID: z.string(),
    CONTABO_CLIENT_SECRET: z.string(),

    CONTABO_API_USERNAME: z.string(),
    CONTABO_API_PASSWORD: z.string(),
    CONTABO_ACCOUNT_USERNAME: z.string(),
    CONTABO_ACCOUNT_PASSWORD: z.string(),

    CONTABO_VPS_LOGIN_USERNAME: z.string(),
    CONTABO_VPS_LOGIN_PASSWORD: z.string(),
    CONTABO_VPS_LOGIN_PASSWORD_ID: z.coerce.number(),

    DATABASE_NAME: z.string(),
    MY_IP: z.string().nullish(),

    DOMAIN_PURCHASE_FIRST_NAME: z.string(),
    DOMAIN_PURCHASE_LAST_NAME: z.string(),
    DOMAIN_PURCHASE_CITY: z.string(),
    DOMAIN_PURCHASE_PHONE: z.string(),
    DOMAIN_PURCHASE_COUTNRY: z.string(),
    DOMAIN_PURCHASE_ADDRESS: z.string(),
    DOMAIN_PURCHASE_POSTAL_CODE: z.string(),
    DOMAIN_PURCHASE_EMAIL_ADDRESS: z.string(),
    DOMAIN_PURCHASE_STATE_PROVICE: z.string(),

    DNS_SIMPLE_EMAIL: z.string(),
    DNS_SIMPLE_PASSWORD: z.string(),

    DNS_LIST: jsonStringSchema,

    DNSIMPLE_ACCESS_TOKEN: z.string(),
    DNSIMPLE_ACCOUNT_KEY: z.coerce.number(),
    DNSIMPLE_BASE_URL: z.string().url(),

    CLOUDNS_ID: z.string(),
    CLOUDNS_PASS: z.string(),
    CLOUDNS_BASE_URL: z.string().url(),

    CONSOLE_LOGS: z.enum(["true", "false"]).default("false"),

    FIREBASE_USER_AMEND: z.coerce.boolean().nullish(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  client: {
    PUBLIC_ENV: z.enum(["development", "production"]).default("production"),
    // url
    PUBLIC_URL: z.string().url(),
    PUBLIC_FIREBASE_APIKEY: z.string(),
    PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
    PUBLIC_FIREBASE_PROEJCT_ID: z.string(),
    PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
    PUBLIC_FIREBASE_APP_ID: z.string(),
    PUBLIC_FIREBASE_MEASUREMENT_ID: z.string(),
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: isServer ? process.env : import.meta.env,

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
