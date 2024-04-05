
import type { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/db/index.server";
import { SO_email_open_event } from "~/db/schema.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const imageBuffer = await fetch('https://placehold.co/600x400/111/ddd').then(res => res.arrayBuffer());
  const response = new Response(imageBuffer, { headers: { 'Content-Type': 'image/png' } });
  try{
   const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const sequenceStepId = url.searchParams.get("sequenceStepId");
  if (!email) throw Error("Email is required");
  if (!sequenceStepId) throw Error("Sequence Step ID is required");
  await db.insert(SO_email_open_event).values({
    targetEmail: email,
    sequenceStepId: Number(sequenceStepId),
  });
  } catch(e){
    console.log(e);
  }
  return response;
  // return new Response('', { headers: { 'Content-Type': 'image/gif' } });
}
