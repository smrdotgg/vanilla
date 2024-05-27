import { ActionFunctionArgs, redirect } from "@remix-run/node";
import {sessionLogout} from "~/auth/firebase/auth.server";

export async function action({request}: ActionFunctionArgs) {
  return sessionLogout(request);
}
