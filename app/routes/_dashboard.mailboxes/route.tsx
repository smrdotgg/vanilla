import Page from "./page";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";
import { getUserWorkspaceIdFromCookie } from "~/cookies/workspace";
import { ComputeManager, getVPSInstanceData } from "~/lib/contabo";
import { getDomainData } from "~/services/domain.server/NameCheapDomainService";
import { validateWorkspaceAndRedirectIfInvalid } from "~/auth/workspace";

export async function loader({ request }: LoaderFunctionArgs) {
  const { userWorkspaceId } = await validateWorkspaceAndRedirectIfInvalid({
    request,
  });
  console.log(JSON.stringify(await getVPSInstanceData({id: "201921275"}), null, 2))
          
const workspace = await prisma.workspace.findUnique({
        where: { id: Number(userWorkspaceId) },
        include: {
          domain: {
            where: { deletedAt: null },
            include: { mailbox: {include: {domain:true}} , vps: true },
          },
        },
      })!;

  const mailboxes = workspace!.domain.map((d) => d.mailbox).flat();
  const domains = workspace!.domain;
  return {mailboxes, domains}
}

export { Page as default };

export async function action({ request }: ActionFunctionArgs) {
  return null;
}
