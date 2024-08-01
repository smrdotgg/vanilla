import { prisma } from "~/utils/db";
import { promises } from "dns";
import { DnsimpleService } from "~/sdks/dnsimple";

export const checkReversePointers = ({
  reversePointers,
  domain,
  ipv4,
  ipv6,
}: {
  reversePointers: Awaited<ReturnType<typeof prisma.reverseDnsEntry.findMany>>;
  domain: string;
  ipv4: string;
  ipv6: string;
}) => {
  const ipv6Starter = ipv6.slice(0, 19);
  const ipv4ReversePointer = reversePointers.find((el) => el.from === ipv4);
  const ipv4ReversePointerIsValid = ipv4ReversePointer?.to === domain;
  const ipv6ReversePointer = reversePointers.find(
    (el) => el.from === `${ipv6Starter}:0000:0000:0000:0001`
  );
  const ipv6ReversePointerIsValid = ipv6ReversePointer?.to === domain;
  const ipReversePointersAreValid =
    ipv4ReversePointerIsValid && ipv6ReversePointerIsValid;
  return ipReversePointersAreValid;
};

export const checkReversePointersWithDNS = async ({
  domain,
  ipv4,
  ipv6,
}: {
  domain: string;
  ipv4: string;
  ipv6: string;
}) => {
  const ipv6Starter = ipv6.slice(0, 19);
  ipv6 = `${ipv6Starter}:0000:0000:0000:0001`;

  const ipv4RevPointer = await getReverseDomain({ ip: ipv4 });
  const ipv6RevPointer = await getReverseDomain({ ip: ipv6 });

  const ipv4ReversePointerIsValid = ipv4RevPointer === domain;
  const ipv6ReversePointerIsValid = ipv6RevPointer === domain;
  const ipReversePointersAreValid =
    ipv4ReversePointerIsValid && ipv6ReversePointerIsValid;
  return ipReversePointersAreValid;
};

export const authDomainPointersSet = async ({ domain }: { domain: string }) => {
  domain = domain.toLowerCase();
  const recordList = await DnsimpleService.getDomainRecords({
    domain,
  });
  let mail_domainkeySet = false;
  let dmarcSet = false;
  let spfSet = false;
  let mxSet = false;
  for (const record of recordList) {
    const fullDomain = makeDomain(record.host, domain);
    if (
      fullDomain === `mail._domainkey.${domain}` &&
      record.type.toUpperCase() === "TXT" &&
      Boolean(record.record)
    ) {
      mail_domainkeySet = true;
    }
    if (
      fullDomain === `_dmarc.${domain}` &&
      record.type.toUpperCase() === "TXT" &&
      Boolean(record.record)
    ) {
      dmarcSet = true;
    }
    if (
      fullDomain === domain &&
      record.type.toUpperCase() === "TXT" &&
      record.record.startsWith("v=spf1")
    ) {
      spfSet = true;
    }

    if (
      fullDomain === domain &&
      record.type.toUpperCase() === "MX" &&
      record.record === `mail.${domain}`
    ) {
      mxSet = true;
    }
  }
  return {
    mxSet,
    spfSet,
    dmarcSet,
    mail_domainkeySet,
    allSet: mxSet && spfSet && dmarcSet && mail_domainkeySet,
  };
};

const makeDomain = (subdomain: string, parent: string) =>
  `${subdomain.length ? subdomain + "." : ""}${parent}`.toLowerCase();

const getReverseDomain = async ({ ip }: { ip: string }) => {
  try {
    return await promises
      .reverse(ip)
      .then((r) => r.at(0)?.toLowerCase() ?? null);
  } catch (e: any) {
    if (e.code === "ENOTFOUND") return null;
    throw e;
  }
};

export const getPrefixAndCore = ({ domain }: { domain: string }) => {
  const domainSegments = domain.split(".");
  const coreDomain = `${domainSegments.at(-2)}.${domainSegments.at(-1)}`;
  const prefixSegment =
    domainSegments.length === 2 ? "" : domain.split(`.${coreDomain}`).at(0);
  return { prefix: prefixSegment, core: coreDomain };
};
