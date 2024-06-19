import Page from "./page";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";
import { COOKIES, getUserWorkspaceIdFromCookie } from "~/cookies/workspace";
import {
  ComputeManager,
  cancelInstance,
  reinstateIntance,
} from "~/lib/contabo";
import { getDomainData } from "~/services/domain.server/NameCheapDomainService";
import { INTENTS } from "./types";
import { validateWorkspaceAndRedirectIfInvalid } from "~/auth/workspace";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("Loader function started");

  let userWorkspaceId = await getUserWorkspaceIdFromCookie({ request });
  console.log(`User workspace ID: ${userWorkspaceId}`);

  const session = await validateSessionAndRedirectIfInvalid(request);
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      firebase_id: true,
      workspace_user_join_list: { include: { workspace: true } },
      email: true,
    },
    where: { firebase_id: { equals: session.uid } },
  });
  const cookieHeader = request.headers.get("Cookie");

  const cookie =
    (await COOKIES.selected_workspace_id.parse(cookieHeader)) || {};

  if (!userWorkspaceId && userWorkspaceId !== 0) {
    if (user!.workspace_user_join_list.length === 0) {
      return redirect("/create_workspace");
    }
    userWorkspaceId = user!.workspace_user_join_list.at(0)!.workspace_id;
    cookie.selected_workspace_id =
      user!.workspace_user_join_list.at(0)!.workspace_id;
  }

  const workspaceData = await prisma.workspace.findUnique({
    where: { id: Number(userWorkspaceId) },
    include: {
      domain: {
        where: { deletedAt: null },
        include: { mailbox: true, vps: true },
      },
    },
  });
  const data = { data: workspaceData };

  const domainData = await Promise.all(
    data.data!.domain.map(async (d) => {
      console.log(`Processing domain: ${d.name}`);
      const domainInfo = await getDomainData({ name: d.name });
      console.log(`Domain info retrieved: ${domainInfo}`);
      const expiresAt =
        domainInfo.ApiResponse.children[3].CommandResponse.children[0]
          .DomainGetInfoResult.children[0].DomainDetails.children[1].ExpiredDate
          .content;
      console.log(`Expires at: ${expiresAt}`);
      return { ...d, expiresAt };
    }),
  );
  console.log("Domain data retrieved:", domainData);

  console.log("Retrieving compute instances");
  const computeInstances = await Promise.all(
    data
      .data!.domain.map((d) => d.vps)
      .flat()
      .filter((d) => d !== null)
      .map((ci) =>
        ComputeManager.getVPSInstanceData({
          id: ci!.compute_id_on_hosting_platform,
        }).then((r) => r.data[0]),
      ),
  );
  console.log("Compute instances retrieved:", computeInstances);

  console.log("Returning data");
  return json(
    { data: domainData, computeInstances },
    {
      headers: {
        "Set-Cookie": await COOKIES.selected_workspace_id.serialize(cookie),
      },
    },
  );
}
export { Page as default };

export async function action({ request }: ActionFunctionArgs) {
  const { userWorkspaceId } = await validateWorkspaceAndRedirectIfInvalid({
    request,
  });

  const formData = await request.formData();
  const intent = String(formData.get("intent"));
  if (intent === INTENTS.deleteDomain) {
    const domainId = String(formData.get("domainId"));
    await prisma.domain.update({
      where: { id: Number(domainId), workspace_id: userWorkspaceId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  return null;
}
