import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { INTENTS } from "./types";
import Page from "./page";
import { NameCheapDomainService } from "~/sdks/namecheap";
import { ErrorBoundary } from "./error";
import { checkDomainTransferability } from "./helpers/whois/index.server";
import { z } from "zod";
import { DnsimpleService } from "~/sdks/dnsimple";
// import { env } from "~/utils/env";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { workspaceMembership } = await workspaceGuard({
    request,
    params,
  });

  const dnsDomains = await prisma.domain_dns_transfer.findMany({
    where: { workspaceId: workspaceMembership.workspace_id, canceledAt: null },
  });
  const workingDnsDomains = dnsDomains.filter((obj) => obj.success);

  const workingDnsDomainsWithMailboxCount = await Promise.all(
    workingDnsDomains.map(async (d) => {
      const mailboxCount = await prisma.mailbox.count({
        where: { domainName: d.name },
      });
      let rootCnameRecord: string | undefined;
      const x = await DnsimpleService.getZone({ domain: d.name });
      if (x) {
        const allRecords = await DnsimpleService.getDomainRecords({
          domain: d.name,
        });
        rootCnameRecord = allRecords
          .filter((record) => record.type === "WR")
          .at(0)?.record;
      }

      return { ...d, mailboxCount, rootCnameRecord };
    })
  );
  const mailboxes = await prisma.mailbox.findMany({
    where: { workspaceId: workspaceMembership.workspace_id, deletedAt: null },
  });

  const dnsPendingTransfers = dnsDomains.filter((obj) => !obj.success);

  const parsedDndPendingTransfers: ((typeof dnsPendingTransfers)[0] & {
    dnsUrls: undefined | string[];
  })[] = [];
  for (const pendingTransfer of dnsPendingTransfers) {
    const x = await DnsimpleService.getZone({ domain: pendingTransfer.name });
    if (x) {
      const allRecords = await DnsimpleService.getDomainRecords({
        domain: pendingTransfer.name,
      });
      const dnsRecords = allRecords.filter((record) => record.type === "NS");

      parsedDndPendingTransfers.push({
        ...pendingTransfer,
        dnsUrls: dnsRecords.map((record) => record.record),
      });
    }
  }

  return {
    mailboxes,
    workspaceMembership,
    dnsPendingTransfers: parsedDndPendingTransfers,
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
      .refine((x) => x.split(".").length === 2, { message: "Invalid domain" })
      .refine((x) => !x.endsWith("."), { message: "Invalid domain" })
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

    const domain = data[0].trim().toLowerCase();
    const addDomainResponse = await DnsimpleService.addZone({ domain });
    const checkDomainResponse = await DnsimpleService.getZone({ domain });
    if (addDomainResponse.status === "Failed" || !checkDomainResponse) {
      return { ok: false, message: "Failed to add domain" };
    }

    await prisma.domain_dns_transfer.create({
      data: {
        name: domain,
        workspaceId: Number(session.workspaceMembership.workspace_id),
        userId: session.user.id,
      },
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
  } else if (intent === INTENTS.addRedirectForDomain) {
    const domainName = String(body.get("domainName")).trim().toLowerCase();
    console.log(`Domain name: ${domainName}`);

    let redirectTo = String(body.get("targetUrl"));
    console.log(`Redirect to: ${redirectTo}`);
    // if (redirectTo.startsWith("https://"))
    //   redirectTo = redirectTo.split("https://")[1];
    // if (redirectTo.startsWith("http://"))
    //   redirectTo = redirectTo.split("http://")[1];

    const domain = await prisma.domain_dns_transfer.findFirst({
      where: {
        name: domainName.trim().toLowerCase(),
        workspaceId: Number(session.workspaceMembership.workspace_id),
      },
    });

    if (!domain) {
      console.error("Domain not found");
      return { ok: false, message: "Domain not found" };
    }

    const records = await DnsimpleService.getDomainRecords({
      domain: domainName,
    });
    console.log(`Records: ${records.length}`);

    const targetRecords = records
      .filter((r) => r.host === "")
      .filter((r) => r.type.toUpperCase() === "WR")
      .map((r) => r.id);
    console.log(`Target records: ${targetRecords.length}`);

    for (const targetRecordId of targetRecords) {
      await DnsimpleService.deleteRecord({
        domain: domainName,
        recordId: targetRecordId,
      });
      console.log(`Deleted record: ${targetRecordId}`);
    }

    if (redirectTo) {
      const response = await DnsimpleService.addRecord({
        record: {
          ttl: "60",
          recordType: "WR",
          address: redirectTo,
          hostName: "",
          redirect_type: "301",
          frame: "0",
        },
        domain: domainName,
      });
    }

    return { ok: true, message: null };
    console.log("Operation completed successfully");
  }
  throw Error("Unknown Intent");
};
function countChar(str: string, char: string) {
  return (str.match(new RegExp(char, "g")) || []).length;
}
