import { count, eq } from "drizzle-orm";
import { z } from "zod";
import {
  TB_binding_campaigns_contacts,
  TB_campaigns,
  TB_contacts,
  TB_posts,
} from "~/db/schema.server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const campaignRouter = createTRPCRouter({
  ping: protectedProcedure.query(async ({ ctx, input }) => {
    return "SECRET DATA HOLY SMOKES";
  }),
  setDeadline: publicProcedure
    .input(z.object({ campaignId: z.string(), deadline: z.date() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(TB_campaigns)
        .set({ deadline: input.deadline })
        .where(eq(TB_campaigns.id, input.campaignId));
    }),
  getContacts: publicProcedure
    .input(
      z.object({
        getAll: z.boolean().default(false),
        campaignId: z.string(),
        cursor: z.number().default(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const batchSize = 25;

      const dbCall = await ctx.db.select({ count: count() }).from(TB_contacts);
      const ids = (await ctx.db.select().from(TB_contacts)).map((c) => c.id);

      const contactCount = dbCall[0].count;
      const pageCount = Math.ceil(contactCount / batchSize);

      const selectedContacts = await ctx.db
        .select()
        .from(TB_contacts)
        .leftJoin(
          TB_binding_campaigns_contacts,
          eq(TB_binding_campaigns_contacts.contactId, TB_contacts.id),
        )
        .where(eq(TB_binding_campaigns_contacts.campaignId, input.campaignId));
      const selectedContactIds: number[] = [];
      for (const el of selectedContacts) {
        if (el.campaigns_contacts?.contactId != null)
          selectedContactIds.push(el.campaigns_contacts?.contactId);
      }

      return {
        data: await ctx.db
          .select()
          .from(TB_contacts)
          .limit(batchSize * input.cursor),
        // .offset((input.cursor - 1) * batchSize),
        cursor: input.cursor,
        campaignId: input.campaignId,
        batchSize,
        pageCount,
        contactCount,
        ids,
        selectedContactIds,
      };
    }),
  updateContactPairings: publicProcedure
    .input(
      z.object({
        mode: z.enum(["excludeSpecified", "useOnlySpecified"]),
        campaignId: z.number(),
        exceptions: z.number().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (db) => {
        await db
          .delete(TB_binding_campaigns_contacts)
          .where(
            eq(TB_binding_campaigns_contacts.campaignId, input.campaignId),
          );
        if (input.mode === "useOnlySpecified") {
          if (input.exceptions.length)
            await db.insert(TB_binding_campaigns_contacts).values(
              input.exceptions.map((contactId) => ({
                campaignId: input.campaignId,
                contactId: contactId,
              })),
            );
        } else if (input.mode === "excludeSpecified") {
          const allContactIds = await db
            .select({ id: TB_contacts.id })
            .from(TB_contacts);
          const targetContactIds: number[] = [];
          for (const contId of allContactIds) {
            if (!input.exceptions.includes(contId.id)) {
              targetContactIds.push(contId.id);
            }
          }
          await db.insert(TB_binding_campaigns_contacts).values(
            targetContactIds.map((contactId) => ({
              campaignId: input.campaignId,
              contactId: contactId,
            })),
          );
        }
      });
    }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call

      await ctx.db.insert(TB_posts).values({
        name: "",
        // name: input.name,
        // createdById: ctx.session.user.id,
      });
    }),

  getSecretMessage: publicProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
