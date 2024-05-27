import { count, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import {
  TB_contacts,
  TB_domainPurchaseDetails,
  TB_posts,
} from "~/db/schema.server";
import { domainUserInfoZodSchema } from "~/routes/_dashboard.domains_.purchase_form/components/domain_user_info_form";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { DomainService } from "~/services/domain.server";

export const domainsRouter = createTRPCRouter({
  setDomainUserInfo: protectedProcedure
    .input(domainUserInfoZodSchema)
    .mutation(async ({ ctx, input }) => {
      const newVals = {
        userId: ctx.session.uid,
        ...input,
      };
      await ctx.db
        .insert(TB_domainPurchaseDetails)
        .values(newVals)
        .onConflictDoUpdate({
          target: TB_domainPurchaseDetails.userId,
          set: newVals,
        });
    }),
  purchaseDomain: protectedProcedure
    .input(z.object({ domainName: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.uid !== input.userId) throw Error();
      return await DomainService.purchaseDomain({
        userId: input.userId,
        domainName: input.domainName,
      });
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
