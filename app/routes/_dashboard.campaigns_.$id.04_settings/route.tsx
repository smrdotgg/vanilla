import { LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";
import { eq } from "drizzle-orm";

export async function loader({ params }: LoaderFunctionArgs) {
return null;
  // const data = await db
  //   .select()
  //   .from(TB_analytic_settings)
  //   .where(eq(TB_analytic_settings.campaignId, Number(params.id)));
  // console.log(`data = ${JSON.stringify(data)}`);
  // return { data: data.length ? data[0] : undefined };

}

export { Page as default };
