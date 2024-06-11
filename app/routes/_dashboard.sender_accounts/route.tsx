import {  LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return null;
  // const googleUserInfos = (await db.select().from(TB_google_user_info)).map(
  //   (googleUser) => ({
  //     email: googleUser.email,
  //     name: googleUser.name,
  //     profilePic: googleUser.picture,
  //   }),
  // );
  // const senderAccounts = await db.select().from(TB_sender_emails);
  // return { googleUserInfos, senderAccounts };
};

export { Page as default };
