import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  TB_sender_emails,
  TB_campaign_sender_email_link,
} from "~/db/schema.server";
import { rowSchema } from "~/routes/_dashboard.sender_accounts/components/bulk_modal";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const senderAccountsRouter = createTRPCRouter({
  setSelected: publicProcedure
    .input(z.object({ campaignId: z.string(), ids: z.string().array() }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      await db.transaction(async (db) => {
        await db
          .delete(TB_campaign_sender_email_link)
          .where(
            eq(TB_campaign_sender_email_link.campaignId, input.campaignId),
          );
        if (input.ids.length)
          await db.insert(TB_campaign_sender_email_link).values(
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
      await ctx.db.insert(TB_sender_emails).values(input);
    }),
});
