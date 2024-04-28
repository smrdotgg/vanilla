import { defer, redirect } from "@remix-run/node";
import { db } from "~/db/index.server";
import {
  TB_binding_campaigns_contacts,
  TB_campaigns,
} from "~/db/schema.server";
import { eq, sql } from "drizzle-orm";
import { Page } from "./page";

export const loader = async () => {
  const d = await db
    .select({
      id: TB_campaigns.id,
      name: TB_campaigns.name,
      createdAt: TB_campaigns.createdAt,
      updatedAt: TB_campaigns.updatedAt,
      deadline: TB_campaigns.deadline,
      contactCount:
        sql<number>`COUNT(${TB_binding_campaigns_contacts.contactId})`.mapWith(
          Number,
        ),
    })
    .from(TB_campaigns)
    .leftJoin(
      TB_binding_campaigns_contacts,
      eq(TB_binding_campaigns_contacts.campaignId, TB_campaigns.id),
    )
    .groupBy(TB_campaigns.id)
    .then((list) =>
      list.map((camp) => ({
        ...camp,
        isDraft: camp.deadline === null,
      })),
    );

  return defer({ d  });

};

export { Page as default };

export const action = async () => {
  const newCampaigns = await db.insert(TB_campaigns).values({}).returning();
  return redirect(`/campaigns/${newCampaigns[0].id}`);
};
