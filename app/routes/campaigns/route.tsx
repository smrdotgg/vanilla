import { redirect } from "@remix-run/node";
import { db } from "~/db/index.server";
import {
  SO_binding_campaigns_contacts,
  SO_campaigns,
} from "~/db/schema.server";
import { eq, sql } from "drizzle-orm";
import { Page } from "./page";

export const loader = async () => {
  const d = await db
    .select({
      id: SO_campaigns.id,
      name: SO_campaigns.name,
      createdAt: SO_campaigns.createdAt,
      updatedAt: SO_campaigns.updatedAt,
      deadline: SO_campaigns.deadline,
      contactCount:
        sql<number>`COUNT(${SO_binding_campaigns_contacts.contactId})`.mapWith(
          Number,
        ),
    })
    .from(SO_campaigns)
    .leftJoin(
      SO_binding_campaigns_contacts,
      eq(SO_binding_campaigns_contacts.campaignId, SO_campaigns.id),
    )
    .groupBy(SO_campaigns.id)
    .then((list) =>
      list.map((camp) => ({
        ...camp,
        isDraft: camp.deadline === null,
      })),
    );

  return d;
};

export { Page as default };

export const action = async () => {
  const newCampaigns = await db.insert(SO_campaigns).values({}).returning();
  return redirect(`/campaigns/${newCampaigns[0].id}`);
};
