import { LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";
import { db } from "~/db/index.server";
import {
  SO_binding_campaigns_contacts,
  SO_campaigns,
  SO_email_link_click,
  SO_email_open_event,
  SO_sequence_steps,
} from "~/db/schema.server";
import { eq, and } from "drizzle-orm";

export const loader = async (args: LoaderFunctionArgs) => {
  const id = Number(args.params.id);
  const campaign = (
    await db.select().from(SO_campaigns).where(eq(SO_campaigns.id, id))
  )[0];

  // deliverability;
  const boundedSteps = (
    await db
      .select()
      .from(SO_sequence_steps)
      .where(
        and(
          ...[
            eq(SO_sequence_steps.campaignId, id),
            eq(SO_sequence_steps.state, "bounced"),
          ],
        ),
      )
  ).length;
  const sentSteps = (
    await db
      .select()
      .from(SO_sequence_steps)
      .where(
        and(
          ...[
            eq(SO_sequence_steps.campaignId, id),
            eq(SO_sequence_steps.state, "sent"),
          ],
        ),
      )
  ).length;

  const deliverability =(boundedSteps + sentSteps) ?  (1 - boundedSteps / (boundedSteps + sentSteps)) : 0;

  // open rate
  const openedCount = (await db
    .select()
    .from(SO_sequence_steps)
    .where(and(...[eq(SO_sequence_steps.campaignId, id)]))
    .leftJoin(
      SO_email_open_event,
      eq(SO_email_open_event.sequenceStepId, SO_sequence_steps.id),
    )).filter(i => i.email_open_event).length;
  const contactsCount = (
    await db
      .select()
      .from(SO_binding_campaigns_contacts)
      .where(eq(SO_binding_campaigns_contacts.campaignId, id))
  ).length;
  const maxContactsOpened = sentSteps * contactsCount;

  const openRate = maxContactsOpened ? openedCount / maxContactsOpened : 0;


  
  // click-through rate
  // await db.select().from(SO_email_link_click



  return { campaign, deliverability, openRate };
};

export { Page as default };
