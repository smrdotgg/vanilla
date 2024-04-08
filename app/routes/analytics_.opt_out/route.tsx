import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {  eq } from "drizzle-orm";
import { db } from "~/db/index.server";
import {
  TB_analytic_settings,
  TB_email_opt_out_event,
  TB_sequence_steps,
} from "~/db/schema.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // get params
  const email = url.searchParams.get("email");
  const sequenceStepId = url.searchParams.get("sequenceStepId");
  if (!email) throw Error("Email is required");
  if (!sequenceStepId) throw Error("Sequence Step ID is required");


  await db.insert(TB_email_opt_out_event).values({
    targetEmail: email,
    sequenceStepId: Number(sequenceStepId),
  });
  const seqStep = await db
    .select()
    .from(TB_sequence_steps)
    .where(eq(TB_sequence_steps.id, Number(sequenceStepId)))
    .leftJoin(
      TB_analytic_settings,
      eq(TB_analytic_settings.campaignId, TB_sequence_steps.campaignId),
    );
  const link = seqStep[0].analytic_settings?.optOutUrl;
  if (link) {
    return redirect(link);
  } else {
    return null;
  }
};

export default function Page() {
  return (
    <div className="flex h-screen w-screen *:m-auto">
      <p className="text-center  text-3xl">
        You have successfully unsubscribed from our email campaign.
        <br /> You may now close this window.
      </p>
    </div>
  );
}
