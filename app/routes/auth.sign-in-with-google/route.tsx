import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { generateCodeVerifier, generateState } from "arctic";
import { google } from "~/auth/lucia.server";
import { serializeCookie } from "oslo/cookie";

export const loader = async (args: LoaderFunctionArgs) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = new URL(await google.createAuthorizationURL(state, codeVerifier));
  url.searchParams.set("scope", "email openid");
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    serializeCookie("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set `Secure` flag in HTTPS
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    }),
  );
  headers.append(
    "Set-Cookie",
    serializeCookie("code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/",
    }),
  );
  return redirect(url.toString(), { headers });
};
