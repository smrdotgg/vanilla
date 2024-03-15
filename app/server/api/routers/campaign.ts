import { eq } from "drizzle-orm";
import { z } from "zod";
import { SO_campaigns, SO_posts } from "~/db/schema.server";

import {
  createTRPCRouter,
  // protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
// import { posts } from "~/server/db/schema";

export const campaignRouter = createTRPCRouter({
  setDeadline: publicProcedure
    .input(z.object({ campaignId: z.number(), deadline: z.date() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(SO_campaigns)
        .set({deadline: input.deadline})
        .where(eq(SO_campaigns.id, input.campaignId));
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call

      await ctx.db.insert(SO_posts).values({
        name: "",
        // name: input.name,
        // createdById: ctx.session.user.id,
      });
    }),

  getSecretMessage: publicProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
