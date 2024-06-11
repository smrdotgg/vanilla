import { ContactsPage } from "./page";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { senderEmailListSchema } from "./types";
import { readableStreamToString } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // const senderEmails = await db.select().from(SO_sender_emails);
  // const selectedIds = await db
  //   .select()
  //   .from(SO_campaign_sender_email_link)
  //   .where(eq(SO_campaign_sender_email_link.campaignId, Number(params.id)));

  const googleEmails = await db.select().from(TB_google_user_info);
  const selectedGoogle = await db
    .select()
    .from(TB_google_campaign_bridge)
    .where(eq(TB_google_campaign_bridge.campaignId, Number(params.id)));
  const senderAccounts = await db.select().from(TB_sender_emails);
  const selectedSenders = await db
    .select()
    .from(TB_campaign_sender_email_link)
    .where(eq(TB_campaign_sender_email_link.campaignId, Number(params.id)));

  // return { googleEmails, selectedGoogle, senderAccounts, selectedSenders };
  return { senderAccounts, selectedSenders };

  // return { senderEmails, selectedIds };
};

export { ContactsPage as default };

export const action = async (args: ActionFunctionArgs) => {
  const body = await readableStreamToString(args.request.body!);

  const data = senderEmailListSchema.parse(JSON.parse(body));
  await db.transaction(async (db) => {
    await db
      .delete(TB_google_campaign_bridge)
      .where(eq(TB_google_campaign_bridge.campaignId, data.campaignId));
    if (data.senderIds.length)
      await db.insert(TB_google_campaign_bridge).values(
        data.senderIds.map((senderid) => ({
          campaignId: data.campaignId,
          googleUserId: senderid,
        })),
      );
  });
  return null;
};
