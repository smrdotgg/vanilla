import { promises } from "dns";
import { prisma } from "~/utils/db";
import { DnsimpleService } from "~/sdks/dnsimple";
import { consoleLog } from "~/utils/console_log";

/**
 * Cron job to check and update the status of domain DNS transfers.
 *
 * This function performs the following tasks:
 * 1. Retrieves a list of DNS servers from the environment variable.
 * 2. Fetches all pending DNS transfers from the database.
 * 3. For each pending transfer:
 *    - Resolves the current nameservers for the domain.
 *    - Compares the resolved nameservers with the expected DNS list.
 *    - Updates the transfer status in the database based on the comparison.
 *
 * @async
 * @function dnsDomainTransferCron
 * @throws {Error} If there's an issue with database operations or DNS resolution.
 */
export const dnsDomainTransferCron = async () => {
  consoleLog("Starting DNS domain transfer cron job");

  const pendingDnsTransfers = await prisma.domain_dns_transfer.findMany({
    where: {
      canceledAt: null,
    },
  });

  consoleLog(`Found ${pendingDnsTransfers.length} pending DNS transfers`);

  for (const pendingTransfer of pendingDnsTransfers) {
    consoleLog(`Processing pending transfer: ${pendingTransfer.name}`);

    const dnsList = (
      await DnsimpleService.getDomainRecords({ domain: pendingTransfer.name })
    )
      .filter((value) => value.type.toUpperCase() === "NS")
      .map((i) => i.record.trim().toLowerCase());

    consoleLog(`Fetched DNS records: ${JSON.stringify(dnsList)}`);

    const currentDNS = await promises
      .resolveNs(pendingTransfer.name)
      .then((nsList) => nsList.map((ns) => ns.toLowerCase().trim()));

    consoleLog(`Current DNS records: ${JSON.stringify(currentDNS)}`);

    if (dnsList.every((dns) => currentDNS.includes(dns))) {
      consoleLog(`DNS records match for ${pendingTransfer.name}`);
      if (!pendingTransfer.success) {
        await prisma.domain_dns_transfer.update({
          where: { id: pendingTransfer.id },
          data: { success: true },
        });
        consoleLog(`Updated transfer to success: ${pendingTransfer.id}`);
      }
    } else {
      consoleLog(`DNS records mismatch for ${pendingTransfer.name}`);
      await prisma.domain_dns_transfer.update({
        where: { id: pendingTransfer.id },
        data: {
          success: pendingTransfer.success ? false : undefined,
          note: `DNS mismatch. Currently ${JSON.stringify(currentDNS)}`,
        },
      });
      consoleLog(`Updated transfer with note: ${pendingTransfer.id}`);
    }
  }

  consoleLog("DNS domain transfer cron job completed");
};
