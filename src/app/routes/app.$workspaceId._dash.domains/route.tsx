import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { INTENTS } from "./types";
import Page from "./page";
import { NameCheapDomainService } from "~/sdks/namecheap";
import { ErrorBoundary } from "./error";
import { checkDomainTransferability } from "./helpers/whois/index.server";
import { z } from "zod";

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

  const dnsDomains = await prisma.domain_dns_transfer.findMany({
    where: { workspaceId: workspaceMembership.workspace_id, canceledAt: null },
  });
  const dnsPendingTransfers = dnsDomains.filter((obj) => !obj.success);
  const workingDnsDomains = dnsDomains.filter((obj) => obj.success);

  const workingDnsDomainsWithMailboxCount = await Promise.all(
    workingDnsDomains.map(async (d) => {
      const mailboxCount = await prisma.mailbox.count({
        where: { domainName: d.name },
      });
      return { ...d, mailboxCount };
    })
  );

  return {
    user,
    domains,
    pendingTransfers,
    workspaceMembership,
    dnsPendingTransfers,
    workingDnsDomains: workingDnsDomainsWithMailboxCount,
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
    return { ok: true, message: null };
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
    return { ok: true, message: null };
  } else if (intent === INTENTS.transferInDomain) {
    const domainName = String(body.get("domain"));
    const code = String(body.get("code"));

    const { message, isTransferable } = await checkDomainTransferability({
      domain: domainName,
    });
    if (!isTransferable) {
      return { intent, ok: false, message: `${domainName}: ${message}` };
    }

    let namecheapTransferOrder: Awaited<
      ReturnType<typeof NameCheapDomainService.placeTransferOrder>
    >;
    try {
      namecheapTransferOrder = await NameCheapDomainService.placeTransferOrder({
        domain: domainName,
        eppCode: code,
      });
    } catch (e) {
      console.error(e);
      throw Error("Transfer API Error");
    }
    if (namecheapTransferOrder.Transfer === "false") {
      throw Error("Transfer Placement Error");
    }

    await prisma.domain_transfer.create({
      data: {
        userId: session.user.id,
        workspaceId: session.workspaceMembership.workspace_id,
        name: namecheapTransferOrder.DomainName,
        namecheap_transfer: {
          create: {
            namecheapId: namecheapTransferOrder.TransferID,
          },
        },
      },
    });

    return { domain: domainName, intent, ok: true, message: null };
    // handle code
  } else if (intent === INTENTS.resubmitTransfer) {
    const transferId = String(body.get("transferId"));
    const code = String(body.get("code"));
    const domain = String(body.get("domain"));
    console.log({ domain, transferId, code });
    let namecheapResponse: Awaited<
      ReturnType<typeof NameCheapDomainService.placeTransferOrder>
    >;
    try {
      namecheapResponse = await NameCheapDomainService.placeTransferOrder({
        domain: domain,
        eppCode: code,
      });
    } catch (e) {
      console.error(e);
      throw Error("Transfer API Error");
    }
    const domainTransfer = await prisma.domain_transfer.findFirst({
      where: { id: Number(transferId) },
    });
    if (!domainTransfer) throw Error("Domain Transfer data not found");
    await prisma.namecheap_transfer.create({
      data: {
        domain_transferId: Number(transferId),
        namecheapId: namecheapResponse.TransferID,
      },
    });
    return { domain, intent, ok: true, message: null };
  } else if (intent === INTENTS.transferDomainViaDNS) {
    const inputCount = Number(body.get("inputCount"));
    const { error, data } = z
      .string()
      .min(1)
      .array()
      .safeParse(
        [...Array(inputCount).keys()].map((i) =>
          String(body.get(`domains[${i}].name`))
        )
      );
    if (error) {
      // type of [number, string]
      const errors = Object.fromEntries(
        Object.entries(error.formErrors.fieldErrors)
          .map(([key, val]) => {
            if (val === undefined) return;
            if (val.length === 0) return;
            return [Number(key), val[0]] as [number, string];
          })
          .filter((x) => x !== undefined)
      );
      // .errors.map((e) => e.message)[0];
      return { ok: false, message: JSON.stringify(errors) };
    }

    await prisma.domain_dns_transfer.createMany({
      data: data.map((d) => ({
        name: d,
        workspaceId: Number(session.workspaceMembership.workspace_id),
        userId: session.user.id,
      })),
    });
    return { ok: true, message: null };
  } else if (intent === INTENTS.deleteDomainViaDNS) {
    const domainId = String(body.get("domainDnsTransferId"));
    if (domainId && domainId !== "null") {
      console.log('domainId && domainId !== "null"');
      console.log(domainId);
      console.log(
        await prisma.domain_dns_transfer.findMany({
          where: {
            id: Number(domainId),
            workspaceId: session.workspaceMembership.workspace_id,
          },
        })
      );
      await prisma.domain_dns_transfer.update({
        where: {
          id: Number(domainId),
          workspaceId: session.workspaceMembership.workspace_id,
        },
        data: { canceledAt: new Date() },
      });
    }
    return { ok: true, message: null };
  }
  throw Error("Unknown Intent");
};
