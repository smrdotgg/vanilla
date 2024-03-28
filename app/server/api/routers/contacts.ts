import { count, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import { SO_campaigns, SO_contacts, SO_posts } from "~/db/schema.server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const contactsRouter = createTRPCRouter({
  setDeadline: publicProcedure
    .input(z.object({ campaignId: z.number(), deadline: z.date() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(SO_campaigns)
        .set({ deadline: input.deadline })
        .where(eq(SO_campaigns.id, input.campaignId));
    }),
  getContacts: publicProcedure
    .input(z.object({ cursor: z.number().default(1) }))
    .query(async ({ input, ctx }) => {
      const batchSize = 25;

      const dbCall = await ctx.db.select({ count: count() }).from(SO_contacts);
      const ids = (await ctx.db.select().from(SO_contacts)).map((c) => c.id);

      const contactCount = dbCall[0].count;
      const pageCount = Math.ceil(contactCount / batchSize);

      return {
        data: await ctx.db
          .select()
          .from(SO_contacts)
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
        exceptions: z.number().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.mode === "all") {
        if (input.exceptions.length > 0) {
          await ctx.db
            .delete(SO_contacts)
            .where(notInArray(SO_contacts.id, input.exceptions));
        } else {
          await ctx.db.delete(SO_contacts);
        }
      } else if (input.mode === "none") {
        if (input.exceptions.length > 0) {
          await ctx.db
            .delete(SO_contacts)
            .where(inArray(SO_contacts.id, input.exceptions));
        } else {
          // nothing selected
        }
      }
    }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(SO_posts).values({
        name: "",
      });
    }),

  getSecretMessage: publicProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
