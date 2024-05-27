import { count, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import { TB_campaigns, TB_contacts, TB_posts } from "~/db/schema.server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const contactsRouter = createTRPCRouter({
  setDeadline: publicProcedure
    .input(z.object({ campaignId: z.string(), deadline: z.date() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(TB_campaigns)
        .set({ deadline: input.deadline })
        .where(eq(TB_campaigns.id, input.campaignId));
    }),
  getContacts: publicProcedure
    .input(z.object({ cursor: z.number().default(1) }))
    .query(async ({ input, ctx }) => {
      const batchSize = 25;

      const dbCall = await ctx.db.select({ count: count() }).from(TB_contacts);
      const ids = (await ctx.db.select().from(TB_contacts)).map((c) => c.id);

      const contactCount = dbCall[0].count;
      const pageCount = Math.ceil(contactCount / batchSize);

      return {
        data: await ctx.db
          .select()
          .from(TB_contacts)
          .limit(batchSize)
          .offset((input.cursor - 1) * batchSize),
        cursor: input.cursor,
        batchSize,
        pageCount,
        contactCount,
        ids,
      };
    }),
  delete: publicProcedure
    .input(
      z.object({
        mode: z.enum(["all", "none"]),
        exceptions: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.mode === "all") {
        if (input.exceptions.length > 0) {
          await ctx.db
            .delete(TB_contacts)
            .where(notInArray(TB_contacts.id, input.exceptions));
        } else {
          await ctx.db.delete(TB_contacts);
        }
      } else if (input.mode === "none") {
        if (input.exceptions.length > 0) {
          await ctx.db
            .delete(TB_contacts)
            .where(inArray(TB_contacts.id, input.exceptions));
        } else {
          // nothing selected
        }
      }
    }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(TB_posts).values({
        name: "",
      });
    }),

  getSecretMessage: publicProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
