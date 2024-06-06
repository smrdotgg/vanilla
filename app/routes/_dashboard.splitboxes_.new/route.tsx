import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Page } from "./page";
import { generateId } from "lucia";
import { INTENTS, formSchema } from "./types";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";
import { ComputeManager, getAccessToken } from "~/lib/contabo";
import { getUserWorkspaceIdFromCookie } from "~/cookies/workspace";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data = await validateSessionAndRedirectIfInvalid(request);
  const splitboxes = await prisma.splitbox.findMany({
    where: { user: { firebase_id: data.uid } },
  });

  return {
    previouslyCreatedSplitboxes: splitboxes.length,
  };
};

export { Page as default };

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Action started");

  const data = await validateSessionAndRedirectIfInvalid(request);
  console.log("Session validated");

  const workspaceId = await getUserWorkspaceIdFromCookie({ request });
  console.log(`Workspace ID: ${workspaceId}`);

  const user = await prisma.user.findFirst({
    where: { firebase_id: data.uid },
  });
  console.log(`User found: ${user?.email}`);

  const requestJson = await request.json();
  console.log("Request JSON: ", requestJson);

  const intent = requestJson["intent"];
  console.log(`Intent: ${intent}`);

  if (intent === INTENTS.CREATE_SPLITBOX) {
    console.log("Creating splitbox");

    const { name } = formSchema.parse(requestJson);
    console.log(`Splitbox name: ${name}`);

    const data = await ComputeManager.createVPSInstance();
    console.log(`VPS instance created with ID: ${data.id}`);

    await prisma.splitbox.create({
      data: {
        name: name,
        workspaceId: Number(workspaceId),
        userId: user!.id,
        compute_id_on_hosting_platform: data.id,
      },
    });
    console.log("Splitbox created");
  }

  return redirect("/splitboxes");
};
