import {  LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";
import { db } from "~/db/index.server";
import { TB_google_user_info, TB_sender_emails } from "~/db/schema.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const googleUserInfos = (await db.select().from(TB_google_user_info)).map(
    (googleUser) => ({
      email: googleUser.email,
      name: googleUser.name,
      profilePic: googleUser.picture,
    }),
  );
  const senderAccounts = await db.select().from(TB_sender_emails);
  return { googleUserInfos, senderAccounts };
};

export { Page as default };
