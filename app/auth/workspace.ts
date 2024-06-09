import { prisma } from "~/db/prisma";
import { validateSessionAndRedirectIfInvalid } from "./firebase/auth.server";
import { getUserWorkspaceIdFromCookie } from "~/cookies/workspace";
import { redirect } from "@remix-run/node";
import { CREATE_WORKSPACE_ROUTE } from "./contants";

export async function validateWorkspaceAndRedirectIfInvalid({
  request,
}: {
  request: Request;
}) {
  const session = await validateSessionAndRedirectIfInvalid(request);
  const userWorkspaceId = await getUserWorkspaceIdFromCookie({ request });
  const workspaceData = await prisma.workspace.findUnique({
    where: { id: Number(userWorkspaceId) },
    include: {
      domain: { include: { mailbox: true, vps: true } },
    },
  });

  if (workspaceData === null) {
    throw redirect(CREATE_WORKSPACE_ROUTE, { status: 404 });
  }
  return { workspaceData, session, userWorkspaceId };
}
