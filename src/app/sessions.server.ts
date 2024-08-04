import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";
// import { env } from "~/utils/env";

// const isProduction = env.NODE_ENV === "production";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["s3cr3t"],
    // Set domain and secure only if in production
    // ...(isProduction
    //   ? { domain: "your-production-domain.com", secure: true }
    //   : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
