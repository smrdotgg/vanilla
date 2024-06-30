import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { INTENTS } from "./types";
import Page from "./page";
import { NameCheapDomainService } from "~/sdks/namecheap";
import { ErrorBoundary } from "./error";
import { checkDomainTransferability } from "./helpers/whois/index.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user, workspaceMembership } = await workspaceGuard({
    request,
    params,
  });
  const domains = await prisma.domain
    .findMany({
      where: { workspace_id: workspaceMembership.id, deletedAt: null },
      include: { mailbox: true },
    })
    .then(
      async (domains) =>
        await Promise.all(
          domains.map(async (domain) => ({
            ...domain,
            expiresAt: (
              await NameCheapDomainService.getDomainData({ name: domain.name })
            ).ApiResponse.children[3].CommandResponse.children[0]
              .DomainGetInfoResult.children[0].DomainDetails.children[1]
              .ExpiredDate.content,
          }))
        )
    );
  const pendingTransfers = await prisma.domain_transfer.findMany({
    where: { workspaceId: workspaceMembership.workspace_id, deletedAt: null },
  });
  return {
    user,
    domains,
    pendingTransfers,
    workspaceMembership,
  };
};

export { Page as default, ErrorBoundary };

export const action = async ({ request, params }: ActionFunctionArgs) => {
  console.log("ACTION");
  const session = await workspaceGuard({ request, params });

  const body = await request.formData();
  const intent = body.get("intent");
  if (intent === INTENTS.deleteTransfer) {
    const transferId = String(body.get("transferId"));
    if (transferId && transferId !== "null") {
      await prisma.domain_transfer.update({
        where: {
          id: Number(transferId),
          workspaceId: session.workspaceMembership.workspace_id,
        },
        data: { deletedAt: new Date() },
      });
    }
    return { ok: true };
  } else if (intent === INTENTS.deleteDomain) {
    const domainId = String(body.get("domainId"));
    if (domainId && domainId !== "null") {
      await prisma.domain.update({
        where: {
          id: Number(domainId),
          workspace_id: session.workspaceMembership.workspace_id,
        },
        data: { deletedAt: new Date() },
      });
    }
    return { ok: true };
  } else if (intent === INTENTS.transferInDomain) {
    const domainName = String(body.get("domain"));
    const code = String(body.get("code"));
    const x = await checkDomainTransferability({ domain: domainName });
    if (!x.isTransferable) {
      return { intent, ok: false, message: `${domainName}: ${x.message}` };
    }

    let namecheapResponse: Awaited<
      ReturnType<typeof NameCheapDomainService.placeTransferOrder>
    >;
    try {
      namecheapResponse = await NameCheapDomainService.placeTransferOrder({
        domain: domainName,
        eppCode: code,
      });
    } catch (e) {
      console.error(e);
      throw Error("Transfer API Error");
    }
    if (namecheapResponse.Transfer === "false") {
      throw Error("Transfer Placement Error");
    }
    await prisma.domain_transfer.create({
      data: {
        name: namecheapResponse.DomainName,
        transfer_id: namecheapResponse.TransferID,
        userId: session.user.id,
        workspaceId: session.workspaceMembership.workspace_id,
      },
    });

    return { domain: domainName, intent, ok: true, message: null };
    // handle code
  }
  throw Error("Unknown Intent");
};
