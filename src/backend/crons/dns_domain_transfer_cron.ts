import { env } from "~/utils/env";
import { promises } from "dns";
import { prisma } from "~/utils/db";

// const dnsimple = new DNSimple({
//   accessToken: env.DNSIMPLE_ACCESS_TOKEN,
//   baseUrl: "https://api.dnsimple.com",
// });

export const dnsDomainTransferCron = async () => {
  // const x = await dnsimple.zones.listZones(env.DNSIMPLE_ACCOUNT_KEY); //.then((r) => console.log(r));
  console.log("running");
  const dnsList = (JSON.parse(env.DNS_LIST) as string[]).map((item) =>
    item.toLowerCase()
  );

  const pendingDnsTransfers = await prisma.domain_dns_transfer.findMany({
    where: {
      canceledAt: null,
    },
  });

  for (const pendingTransfer of pendingDnsTransfers) {
    const currentDNS = await promises
      .resolveNs(pendingTransfer.name)
      .then((nsList) => nsList.map((ns) => ns.toLowerCase()));
    if (dnsList.every((dns) => currentDNS.includes(dns))) {
      if (!pendingTransfer.success) {
        await prisma.domain_dns_transfer.update({
          where: { id: pendingTransfer.id },
          data: { success: true },
        });
      }
    } else {
      await prisma.domain_dns_transfer.update({
        where: { id: pendingTransfer.id },
        data: {
          success: pendingTransfer.success ? false : undefined,
          note: `DNS mismatch. Currently ${JSON.stringify(currentDNS)}`,
        },
      });
    }
  }
};
