import { redirect } from "@remix-run/node";
import { lucia } from "~/auth/lucia.server";

export async function action() {
  return redirect("/", {
    headers: {
      "Set-Cookie": lucia.createBlankSessionCookie().serialize(),
    },
  });
}
