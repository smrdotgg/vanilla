import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { parseCookies, serializeCookie } from "oslo/cookie";
import { db } from "~/db/index.server";
import { TB_users } from "~/db/schema.server";
import { getGoogleidWithAccesstoken } from "~/lib/get_google_data";

export const loader = async (args: LoaderFunctionArgs) => {
  return null;
  // const cookies = parseCookies(args.request.headers.get("Cookie") ?? "");
  // const stateCookie = cookies.get("google_oauth_state") ?? null;
  // const codeVerifier = cookies.get("code_verifier") ?? null;
  //
  // const url = new URL(args.request.url);
  // const state = url.searchParams.get("state");
  // const code = url.searchParams.get("code");
  //
  // if (
  //   !state ||
  //   !stateCookie ||
  //   !code ||
  //   stateCookie !== state ||
  //   !codeVerifier
  // ) {
  //   return null;
  // }
  //
  // const { accessToken } = await google.validateAuthorizationCode(
  //   code,
  //   codeVerifier,
  // );
  // const headers = new Headers();
  // headers.append(
  //   "Set-Cookie",
  //   serializeCookie("google_oauth_state", "", {
  //     maxAge: 0,
  //     path: "/",
  //   }),
  // );
  //
  // headers.append(
  //   "Set-Cookie",
  //   serializeCookie("code_verifier", "", {
  //     maxAge: 0,
  //     path: "/",
  //   }),
  // );
  //
  // const googleData = await getGoogleidWithAccesstoken({ accessToken });
  // const user = await db
  //   .select()
  //   .from(TB_users)
  //   .where(eq(TB_users.email, googleData.email));
  //
  // if (user.length !== 0) {
  //   const session = await lucia.createSession(user[0].id, {});
  //   const sessionCookie = lucia.createSessionCookie(session.id);
  //   headers.append("Set-Cookie", sessionCookie.serialize());
  //   return redirect("/", {
  //     headers,
  //   });
  // }
  // const newUserId = generateId(20);
  // await db.insert(TB_users).values({
  //   id: newUserId,
  //   email: googleData.email,
  //   emailVerified: googleData.email_verified,
  // });
  // const session = await lucia.createSession(newUserId, {});
  // const sessionCookie = lucia.createSessionCookie(session.id);
  // headers.append("Set-Cookie", sessionCookie.serialize());
  // return redirect("/", {headers});
};
