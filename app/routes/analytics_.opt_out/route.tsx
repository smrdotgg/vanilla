import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { and, eq } from "drizzle-orm";
import { db } from "~/db/index.server";
import {
  TB_analytic_settings,
  TB_email_link_click_event,
  TB_email_opt_out_event,
  TB_sequence_steps,
} from "~/db/schema.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("Starting loader function...");

  const url = new URL(request.url);
  console.log(`Received request for URL: ${url.toString()}`);

  // Get params
  const email = url.searchParams.get("email");
  const sequenceStepId = url.searchParams.get("sequenceStepId");
  console.log(`Extracted parameters - Email: ${email}, Sequence Step ID: ${sequenceStepId}`);

  if (!email) {
    console.error("Email parameter is missing.");
    throw Error("Email is required");
  }
  if (!sequenceStepId) {
    console.error("Sequence Step ID parameter is missing.");
    throw Error("Sequence Step ID is required");
  }

  console.log("Fetching sequence step and associated analytics settings...");
  const seqStep = await db
    .select()
    .from(TB_sequence_steps)
    .where(eq(TB_sequence_steps.id, Number(sequenceStepId)))
    .leftJoin(
      TB_analytic_settings,
      eq(TB_analytic_settings.campaignId, TB_sequence_steps.campaignId),
    );
  console.log(`Fetched sequence step data: ${JSON.stringify(seqStep)}`);

  const link = seqStep[0].analytic_settings?.optOutUrl;
  console.log(`Opt-out link determined: ${link || "No link found"}`);

  console.log("Preparing conditions for checking existing opt-out events...");
  const targetEmailCondition = eq(TB_email_opt_out_event.targetEmail, email);
  const sequenceStepIdCondition = eq(TB_email_opt_out_event.campaignId, seqStep[0].sequence_step.campaignId);

  console.log("Checking for existing opt-out events with specified conditions...");
  const existingData = await db
    .select()
    .from(TB_email_opt_out_event)
    .where(
      and(...[targetEmailCondition, sequenceStepIdCondition]),
    );
  console.log(`Existing data check complete. Found ${existingData.length} records.`);

  if (existingData.length !== 0) {
    console.log("User has already unsubscribed.");
    if (link) {
      console.log("Redirecting to opt-out link since user is already unsubscribed.");
      return redirect(link);
    } else {
      console.log("No opt-out link available. Notifying user of previous unsubscribe.");
      return { alreadyUnsubbed: true };
    }
  }

  console.log("Inserting new opt-out event...");
  await db.insert(TB_email_opt_out_event).values({
    targetEmail: email,
    campaignId: seqStep[0].sequence_step.campaignId,
  });
  console.log("Opt-out event successfully inserted.");

  if (link) {
    console.log("Redirecting to opt-out link after successful unsubscribe.");
    return redirect(link);
  } else {
    console.log("Unsubscribe successful. No redirect link available. Returning confirmation.");
    return { alreadyUnsubbed: false };
  }
};



export default function Page() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex h-screen w-screen *:m-auto">
      <p className="text-center  text-3xl">
        {data.alreadyUnsubbed ? (
          <>
            You have already unsubscribed from this email campaign at an earlier
            time.
            <br /> You may close this window.
          </>
        ) : (
          <>
            You have successfully unsubscribed from our email campaign.
            <br /> You may now close this window.
          </>
        )}
      </p>
    </div>
  );
}
