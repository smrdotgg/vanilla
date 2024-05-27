import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  readableStreamToString,
  redirect,
} from "@remix-run/node";
import { Page } from "./page";
import { exchangeCodeForTokens } from "~/api/google/get_token";
import { getUserInfo } from "~/api/google/get_user_info";
import { db } from "~/db/index.server";
import {
  TB_google_tokens,
  TB_google_user_info,
  TB_sender_emails,
} from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { api } from "~/server/trpc/server.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const scope = url.searchParams.get("scope");

  if (code && scope) {
    const newCode = await exchangeCodeForTokens({
      code: code,
      redirectUri: url.origin + url.pathname,
    });
    const userInfo = await getUserInfo({ accessToken: newCode.access_token });
    await db.transaction(async (db) => {
      await db
        .delete(TB_google_user_info)
        .where(eq(TB_google_user_info.googleId, userInfo.id));

      await db.insert(TB_google_user_info).values({
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        locale: userInfo.locale,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        verifiedEmail: userInfo.verified_email,
      });

      await db
        .delete(TB_google_tokens)
        .where(eq(TB_google_tokens.googleId, userInfo.id));

      const currentDate = new Date();
      const expirationDate = new Date(
        currentDate.getTime() + newCode.expires_in * 1000,
      );
      await db.insert(TB_google_tokens).values({
        scope: newCode.scope,
        googleId: userInfo.id,
        expiresIn: expirationDate,
        id_token: newCode.id_token,
        tokenType: newCode.token_type,
        accessToken: newCode.access_token,
        refreshToken: newCode.refresh_token,
      });
    });
    return redirect(url.pathname);
  }

  const googleUserInfos = (await db.select().from(TB_google_user_info)).map(
    (googleUser) => ({
      email: googleUser.email,
      name: googleUser.name,
      profilePic: googleUser.picture,
    }),
  );
  const senderAccounts = await db.select().from(TB_sender_emails);

  const x = await api(request).post.hello.query({ text: "Semere" });
  return { googleUserInfos, senderAccounts, x };
};

export { Page as default };

export const action = async (args: ActionFunctionArgs) => {
  // console.log("Receiving request...");
  //
  // // const fd = await args.request.formData();
  // // console.log("Form data received.");
  //
  // const s = await readableStreamToString(args.request.body!);
  // const body = JSON.parse();
  // console.log("Unarsed data:", s);
  // const data = rowSchema.array().parse(body);
  // console.log("Parsed data:", data);
  // const intent = body["intent"];
  // console.log("Intent:", intent);
  //
  // if (intent == INTENTS.addBulkMailboxes) {
  //   console.log("Adding bulk mailboxes with data:", data);
  //   await db.insert(SO_sender_emails).values(
  //     data.map((d) => ({
  //       ...d,
  //       smtpPort: Number(d.smtpPort),
  //       imapPort: Number(d.imapPort),
  //     })),
  //   );
  //   // await db.insert(SO_sender_emails).values([
  //   //   {
  //   //     ...data,
  //   //     smtpPort: Number(data.smtpPort),
  //   //     imapPort: Number(data.imapPort),
  //   //   },
  //   // ]);
  //   console.log("Bulk mailboxes added.");
  // }
  //
  // console.log("Action completed.");
  // return null;
};
