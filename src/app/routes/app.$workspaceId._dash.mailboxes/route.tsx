import { LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";

export async function loader(args: LoaderFunctionArgs) {
  const session = await workspaceGuard(args);

  const mailboxes = await prisma.mailbox.findMany({
    where: {
      workspaceId: session.workspaceMembership.workspace_id,
      deletedAt: null,
    },
  });

  const dnsDomains = await prisma.domain_dns_transfer.findMany({
    where: {
      workspaceId: session.workspaceMembership.workspace_id,
      canceledAt: null,
    },
  });
  const workingDnsDomains = dnsDomains.filter((obj) => obj.success);

  const domains = await Promise.all(
    workingDnsDomains.map(async (d) => {
      const mailboxCount = await prisma.mailbox.count({
        where: { domainName: d.name },
      });
      return { ...d, mailboxCount };
    })
  );

  return {
    mailboxes,
    domains,
    workspaceId: session.workspaceMembership.workspace_id,
  };
}

export { Page as default };
