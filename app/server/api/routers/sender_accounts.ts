import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  SO_sender_emails,
  SO_campaign_sender_email_link,
} from "~/db/schema.server";
import { rowSchema } from "~/routes/_dashboard.sender_accounts/components/bulk_modal";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const senderAccountsRouter = createTRPCRouter({
  setSelected: publicProcedure
    .input(z.object({ campaignId: z.number(), ids: z.number().array() }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      await db.transaction(async (db) => {
        await db
          .delete(SO_campaign_sender_email_link)
          .where(
            eq(SO_campaign_sender_email_link.campaignId, input.campaignId),
          );
        if (input.ids.length)
          await db.insert(SO_campaign_sender_email_link).values(
            input.ids.map((senderid) => ({
              senderEmailId: senderid,
              campaignId: input.campaignId,
            })),
          );
      });
    }),
  createBulk: publicProcedure
    .input(rowSchema.array())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(SO_sender_emails).values(input);
    }),
});
