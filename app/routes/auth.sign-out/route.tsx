import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { lucia } from "~/auth/lucia.server";

export async function action(args: ActionFunctionArgs) {
  console.log(`Headers = ${JSON.stringify(args.request.headers)}`);
  const sessionId = lucia.readSessionCookie(args.request.headers.get("Cookie") ?? "");
  await lucia.invalidateSession(sessionId ?? "");
  return redirect("/auth/sign-in", {
    headers: {
      "Set-Cookie": lucia.createBlankSessionCookie().serialize(),
    },
  });
}
