import { createCookieSessionStorage } from "@remix-run/node";
import type { ResponseStub } from "@remix-run/server-runtime/dist/single-fetch";
import { env } from "./api";
import { createThemeSessionResolver } from "remix-themes";

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = env.NODE_ENV === "production";

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

// const resolver = async (request) => {
//     const session = await cookieThemeSession.getSession(request.headers.get('Cookie'));
//     return {
//         getTheme: () => {
//             const themeValue = session.get('theme');
//             return (0, theme_provider_1.isTheme)(themeValue) ? themeValue : null;
//         },
//         setTheme: (theme) => session.set('theme', theme),
//         commit: () => cookieThemeSession.commitSession(session),
//     };
// };
// return resolver;
