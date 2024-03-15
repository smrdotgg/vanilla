import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Page } from "./page";
import { db } from "~/db/index.server";
import { SO_campaigns } from "~/db/schema.server";
import { eq } from "drizzle-orm";

export const loader = async (args: LoaderFunctionArgs) => {
  const id = args.params.id;
  const data = await db
    .select().from(SO_campaigns)
    .where(eq(SO_campaigns.id, Number(id)));
  return data[0].name;
};

export { Page as default };

export const action = async (args: ActionFunctionArgs) => {
  const fd = await args.request.formData();
  const campaignName = String(fd.get("campaign_name"));
  const id = args.params.id;
  await db
    .update(SO_campaigns)
    .set({ name: campaignName })
    .where(eq(SO_campaigns.id, Number(id)));
  return redirect(`/campaigns/${id}/01_contacts`);
};
