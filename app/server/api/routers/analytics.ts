import { eq } from "drizzle-orm";
import { z } from "zod";
import { SO_analytic_settings, SO_campaigns } from "~/db/schema.server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  setAnalytics: publicProcedure
    .input(
      z.object({
        campaignId: z.number(),
        openRate: z.boolean(),
        clickThroughRate: z.boolean(),
        replyRate: z.boolean(),
        unsubRate: z.boolean(),
        bounceRate: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
        console.log("got input at trpc func");
        console.log(JSON.stringify(input));
      const data = {
        bounceRate: input.bounceRate,
        replyRate: input.replyRate,
        openRate: input.openRate,
        optOutRate: input.unsubRate,
        clickthroughRate: input.clickThroughRate,
      };
      await ctx.db
        .insert(SO_analytic_settings)
        .values({
          ...data,
          campaignId: input.campaignId,
        })
        .onConflictDoUpdate({
          target: SO_analytic_settings.campaignId,
          set: data,
        });

      // await ctx.db
      //   .update(SO_campaigns)
      //   .set({ deadline: input.deadline })
      //   .where(eq(SO_campaigns.id, input.campaignId));
    }),
});
