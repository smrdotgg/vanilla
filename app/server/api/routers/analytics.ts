import { z } from "zod";
import { SO_analytic_settings, SO_campaigns } from "~/db/schema.server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  setUbsubLink: publicProcedure
    .input(
      z.object({
        link: z.string().nullable(),
        toggle: z.boolean(),
        campaignId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(SO_analytic_settings)
        .values({
          optOutRate: input.toggle,
          optOutUrl: input.link,
          campaignId: input.campaignId,
        })
        .onConflictDoUpdate({
          target: SO_analytic_settings.campaignId,
          set: {
            optOutRate: input.toggle,
            optOutUrl: input.link,
          },
        });
    }),
  setAnalytics: publicProcedure
    .input(
      z.object({
        campaignId: z.number(),
        openRate: z.boolean(),
        clickThroughRate: z.boolean(),
        replyRate: z.boolean(),
        unsubRate: z.boolean(),
        bounceRate: z.boolean(),
        unsubLink: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = {
        bounceRate: input.bounceRate,
        replyRate: input.replyRate,
        openRate: input.openRate,
        optOutRate: input.unsubRate,
        clickthroughRate: input.clickThroughRate,
        optOutUrl: input.unsubLink,
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
