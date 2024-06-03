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
      const data = {
        userId: ctx.session.uid,
        ...input,
      };
      const user = await prisma.user.findFirst({
        where: { firebase_id: ctx.session.uid },
      });
      const newData = {
        user_id: user!.id,
        tech_city: data.techCity,
        admin_city: data.adminCity,
        billing_city: data.billingCity,
        tech_country: data.techCountry,
        admin_country: data.adminCountry,
        tech_address_1: data.techAddress1,
        tech_last_name: data.techLastName,
        admin_address_1: data.adminAddress1,
        admin_last_name: data.adminLastName,
        tech_first_name: data.techFirstName,
        admin_first_name: data.adminFirstName,
        billing_country: data.billingCountry,
        registrant_city: data.registrantCity,
        tech_postal_code: data.techPostalCode,
        admin_postal_code: data.adminPostalCode,
        billing_address_1: data.billingAddress1,
        billing_last_name: data.billingLastName,
        tech_phone_number: data.techPhoneNumber,
        admin_phone_number: data.adminPhoneNumber,
        billing_first_name: data.billingFirstName,
        tech_email_address: data.techEmailAddress,
        admin_email_address: data.adminEmailAddress,
        billing_postal_code: data.billingPostalCode,
        registrant_country: data.registrantCountry,
        tech_state_province: data.techStateProvince,
        admin_state_province: data.adminStateProvince,
        billing_phone_number: data.billingPhoneNumber,
        registrant_address_1: data.registrantAddress1,
        registrant_last_name: data.registrantLastName,
        registrant_first_name: data.registrantFirstName,
        billing_email_address: data.billingEmailAddress,
        billing_state_province: data.billingStateProvince,
        registrant_postal_code: data.registrantPostalCode,
        tech_phone_country_code: data.techPhoneCountryCode,
        admin_phone_country_code: data.adminPhoneCountryCode,
        registrant_phone_number: data.registrantPhoneNumber,
        registrant_email_address: data.registrantEmailAddress,
        billing_phone_country_code: data.billingPhoneCountryCode,
        registrant_state_province: data.registrantStateProvince,
        registrant_phone_country_code: data.registrantPhoneCountryCode,
      };
      await prisma.domain_purchase_form_info.upsert({
        where: {
          user_id: user!.id,
        },
        update: newData,
        create: newData,
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
});
