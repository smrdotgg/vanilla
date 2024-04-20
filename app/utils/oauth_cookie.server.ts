import { createCookie } from "@remix-run/node"; // or cloudflare/deno
import { env } from "~/api";

export const googleOauthStateCookie = createCookie("google_oauth_state", {
  maxAge: 60 * 10, // one week
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  path: "/",
});

export const codeVerifyCookie = createCookie("google_code_verifier", {
  maxAge: 60 * 10, // one week
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  path: "/",
});


//
//
//
//
// headers: {
// 			Location: url.toString(),
// 			"Set-Cookie": serializeCookie("github_oauth_state", state, {
// 				httpOnly: true,
// 				secure: env === "PRODUCTION", // set `Secure` flag in HTTPS
// 				maxAge: 60 * 10, // 10 minutes
// 				path: "/"
// 			})
// 		}
