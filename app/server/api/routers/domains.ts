import { count, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import { prisma } from "~/db/prisma";
import { TB_contacts, TB_domainPurchaseDetails } from "~/db/schema.server";
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
      const user = await prisma.user.findFirst({
        where: { firebase_id: ctx.session.uid },
      });
      const data = {
          user_id: user!.id,
          city: input.registrantCity,
          address: input.registrantAddress1,
          country: input.registrantCountry,
          last_name: input.registrantLastName,
          first_name: input.registrantFirstName,
          postal_code: input.registrantPostalCode,
          phone_number: input.registrantPhoneNumber,
          email_address: input.registrantEmailAddress,
          phone_code: input.registrantPhoneCountryCode,
          state_province: input.registrantStateProvince,
        };
      await prisma.domain_purchase_form_info.upsert({
        where: {
          user_id: user!.id,
        },
        update: data,
        create: data,
      });
    }),
  purchaseDomain: protectedProcedure
    .input(
      z.object({
        domainName: z.string(),
        userId: z.string(),
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("FUNC CALLED");
      if (ctx.user!.id.toString() !== input.userId) throw Error();
      await DomainService.purchaseDomain({
        userId: input.userId,
        domainName: input.domainName,
        workspaceId: input.workspaceId,
      });
    }),
  getContacts: publicProcedure
    .input(z.object({ cursor: z.number().default(1) }))
    .query(async ({ input, ctx }) => {
      const batchSize = 25;

      // const dbCall = await ctx.db.select({ count: count() }).from(TB_contacts);
      // const ids = (await ctx.db.select().from(TB_contacts)).map((c) => c.id);

      // const contactCount = dbCall[0].count;
      // const pageCount = Math.ceil(contactCount / batchSize);

      return {
        // data: await ctx.db
        //   .select()
        //   .from(TB_contacts)
        //   .limit(batchSize)
        //   .offset((input.cursor - 1) * batchSize),
        cursor: input.cursor,
        batchSize,
        // pageCount,
        // contactCount,
        // ids,
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
          // await ctx.db
          //   .delete(TB_contacts)
          //   .where(notInArray(TB_contacts.id, input.exceptions));
        } else {
          // await ctx.db.delete(TB_contacts);
        }
      } else if (input.mode === "none") {
        if (input.exceptions.length > 0) {
          // await ctx.db
          //   .delete(TB_contacts)
          //   .where(inArray(TB_contacts.id, input.exceptions));
        } else {
          // nothing selected
        }
      }
    }),
});
