import { compare } from "ip6addr";
import dns from "dns";

export const ipv6AreEqual = (ip1: string, ip2: string) => {
  try {
    return compare(ip1, ip2) === 0;
  } catch (e) {
    return false;
  }
};

export const prefixPlusDomain = (prefix: string, domain: string) =>
  prefix ? `${prefix}.${domain}` : domain;

export const dnsLookup = ({
  domain,
  mode,
}: {
  domain: string;
  mode: "IPv4" | "IPv6";
}) =>
  dns.promises
    .lookup(domain, { family: Number(mode.at(-1)) })
    .then((r) => r.address)
    .catch(() => undefined);
