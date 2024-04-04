import { LoaderFunctionArgs } from "@remix-run/node";
import {Page} from "./page";
import { db } from "~/db/index.server";
import { SO_campaigns } from "~/db/schema.server";
import { eq } from "drizzle-orm";

export const loader = async (args: LoaderFunctionArgs) => {
  const id = Number(args.params.id);
  const campaign = (await db.select().from(SO_campaigns).where(eq(SO_campaigns.id, id)))[0];
  
  return {campaign};
}

export { Page as default }

