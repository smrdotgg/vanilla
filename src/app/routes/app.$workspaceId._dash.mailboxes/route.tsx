import { LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";

export async function loader(args: LoaderFunctionArgs) {
  const {workspaceMembership} = await workspaceGuard(args);

  const workspace = await prisma.workspace.findUnique({
    where: { id: Number(workspaceMembership.workspace_id) },
    include: {
      domain: {
        where: { deletedAt: null },
        include: { mailbox: { include: { domain: true } }, vps: true },
      },
    },
  })!;

  const mailboxes = workspace!.domain.map((d) => d.mailbox).flat();
  const domains = workspace!.domain;
  return { mailboxes, domains, workspaceMembership };
}

export { Page as default };
