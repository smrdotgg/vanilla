import { db } from "~/db/index.server";
import { ContactsPage } from "./page";
import {
  SO_campaign_sender_email_link,
  SO_sender_emails,
} from "~/db/schema.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { senderEmailListSchema } from "./types";
import { readableStreamToString } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const senderEmails = await db.select().from(SO_sender_emails);
  const selectedIds = await db
    .select()
    .from(SO_campaign_sender_email_link)
    .where(eq(SO_campaign_sender_email_link.campaignId, Number(params.id)));
  console.log(`selectedIds = ${selectedIds}`);

  return { senderEmails, selectedIds };
};

export { ContactsPage as default };

export const action = async (args: ActionFunctionArgs) => {
  const body = await readableStreamToString(args.request.body!);

  const data = senderEmailListSchema.parse(JSON.parse(body));
  await db.transaction(async (db) => {
    await db
      .delete(SO_campaign_sender_email_link)
      .where(eq(SO_campaign_sender_email_link.campaignId, data.campaignId));
    if (data.senderIds.length)
      await db.insert(SO_campaign_sender_email_link).values(
        data.senderIds.map((senderid) => ({
          campaignId: data.campaignId,
          senderEmailId: senderid,
        })),
      );
  });
  return null;
};
