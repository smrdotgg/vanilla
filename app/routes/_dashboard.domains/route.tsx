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
  console.log('Loader function started');

  let userWorkspaceId = await getUserWorkspaceIdFromCookie({ request });
  console.log(`User workspace ID: ${userWorkspaceId}`);

  const session = await validateSessionAndRedirectIfInvalid(request);
  console.log('Session validated');

  const user = await prisma.user.findFirst({
    select: {
      id: true,
      firebase_id: true,
      workspace_user_join_list: { include: { workspace: true } },
      email: true,
    },
    where: { firebase_id: { equals: session.uid } },
  });
  console.log('User data retrieved:', user);

  const cookieHeader = request.headers.get("Cookie");
  console.log('Cookie header:', cookieHeader);

  const cookie =
    (await COOKIES.selected_workspace_id.parse(cookieHeader)) || {};
  console.log('Parsed cookie:', cookie);

  if (!userWorkspaceId && userWorkspaceId !== 0) {
    console.log('No workspace ID found, checking user workspace join list');
    if (user!.workspace_user_join_list.length === 0) {
      console.log('No workspaces found, redirecting to create workspace');
      return redirect("/create_workspace");
    }
    userWorkspaceId = user!.workspace_user_join_list.at(0)!.workspace_id;
    cookie.selected_workspace_id =
      user!.workspace_user_join_list.at(0)!.workspace_id;
    console.log('Updated workspace ID:', userWorkspaceId);
  }

  console.log('Retrieving workspace data');
  const workspaceData = await prisma.workspace.findUnique({
    where: { id: Number(userWorkspaceId) },
    include: {
      domain: {
        where: { deletedAt: null },
        include: { mailbox: true, vps: true },
      },
    },
  });
  console.log('Workspace data retrieved:', workspaceData);

  const data = { data: workspaceData };
  console.log('Data object created:', data);

  console.log('Retrieving domain data');
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
  const response = json(
    { data: domainData, computeInstances },
    {
      headers: {
        "Set-Cookie": await COOKIES.selected_workspace_id.serialize(cookie),
      },
    },
  );
  console.log('Response created:', response);
  return response;
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
