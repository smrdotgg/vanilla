import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Page } from "./page";
import { db } from "~/db/index.server";
import { TB_campaigns } from "~/db/schema.server";
import { eq } from "drizzle-orm";

export const loader = async (args: LoaderFunctionArgs) => {
  const id = args.params.id;
  const data = await db
    .select()
    .from(TB_campaigns)
    .where(eq(TB_campaigns.id, Number(id)));
  return data[0].name;
};

export { Page as default };

export const action = async (args: ActionFunctionArgs) => {
  const fd = await args.request.formData();
  const campaignName = String(fd.get("campaign_name"));
  const id = args.params.id;
  await db
    .update(TB_campaigns)
    .set({ name: campaignName })
    .where(eq(TB_campaigns.id, Number(id)));
  return redirect(`/campaigns/${id}/01_contacts`);
};
