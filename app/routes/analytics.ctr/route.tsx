import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/db/index.server";
import { SO_email_link_click, SO_email_open_event } from "~/db/schema.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  try{
   const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const sequenceStepId = url.searchParams.get("sequenceStepId");
    const originalTarget = url.searchParams.get("originalTarget");
    if (!email) throw Error("Email is required");
    if (!originalTarget) throw Error("Original Target is required");
    if (!sequenceStepId) throw Error("Sequence Step ID is required");
    await db.insert(SO_email_link_click).values({
      targetEmail: email,
      sequenceId: Number(sequenceStepId),
      link: originalTarget,
    });
  } catch(e){
    console.log(e);
  }
  return redirect('originalTarget');
}
