import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { ContaboService } from "~/sdks/contabo";
import { DnsimpleService } from "~/sdks/dnsimple";
import { prisma } from "~/utils/db";
import { PointerTable } from "./components/pointer_table";
import { Button } from "~/components/ui/button";
import { DefaultErrorBoundary } from "~/components/custom/my-error-boundary";
import {
  authDomainPointersSet,
  checkReversePointers,
  checkReversePointersWithDNS,
  getPrefixAndCore,
} from "./helpers";

const fullDomain = (subdomain: string, parent: string) =>
  `${subdomain.length ? subdomain + "." : ""}${parent}`;

export const loader = async () => {
  const domains = await prisma.domain_dns_transfer.findMany({
    where: { canceledAt: null },
  });
  const domainsWithMailboxCount = await Promise.all(domains.map(async (d) => {
    const { core, prefix } = getPrefixAndCore({ domain: d.name });

    const mailboxCount = await prisma.mailbox.count({
      where: {
        domainPrefix: prefix,
        domainName: core,
      },
    });
    return {...d, mailboxCount}
  }));

  const data = await Promise.all(
    domainsWithMailboxCount.map(async (domain) => {
      const vps = await prisma.vps.findFirst({
        where: { domain: domain.name },
      });
      if (!vps) return { ...domain, vps: null };

      const recordList = await DnsimpleService.getDomainRecords({
        domain: domain.name,
      }).then((iplist) => iplist.filter((i) => i.type.toUpperCase() === "A"));
      let ip: string | null = null;

      for (const record of recordList) {
        const recordDomain = fullDomain(record.host, domain.name);
        if (record.type.toUpperCase() === "A" && recordDomain === domain.name) {
          ip = record.record;
        }
      }

      const contaboData = await ContaboService.getVPSInstanceData({
        id: vps!.compute_id_on_hosting_platform,
      }).then((c) => c.data.at(0)!);

      const ipv4 = contaboData.ipConfig.v4.ip;
      const ipv6 = contaboData.ipConfig.v6.ip;
      const ipv6Starter = ipv6.slice(0, 19);

      const reversePointers = await prisma.reverseDnsEntry.findMany({
        where: {
          OR: [{ from: ipv4 }, { from: { startsWith: ipv6Starter } }],
        },
      });
      const ipReversePointersAreValid = checkReversePointers({
        domain: domain.name,
        reversePointers,
        ipv4,
        ipv6,
      });
      const ipreversPointersValidation = await checkReversePointersWithDNS({
        domain: domain.name,
        ipv4,
        ipv6,
      });

      const pointersSet = await authDomainPointersSet({ domain: domain.name });

      return {
        ...domain,
        vps: {
          ...vps!,
          status: contaboData.status,
          ip: { ipv4, ipv6 },
          ipReversePointersAreValid,
          ipreversPointersValidation,
          pointersSet: {
            allSet: pointersSet.allSet,
          },
          readyForEmail:
            ipreversPointersValidation &&
            vps.emailwizInitiated &&
            pointersSet.allSet,
        },
      };
    })
  );

  return { rows: data };
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const [val, setVal] = useState(0);
  return (
    <div>
      <Button onClick={() => (val ? setVal(0) : setVal(1))}>x</Button>
      {!!val && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {!val && <PointerTable />}
      Pointers
    </div>
  );
}

export { DefaultErrorBoundary as ErrorBoundary };
