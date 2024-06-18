import { env } from "~/api";
import { nameCheapBaseUrl } from "~/services/domain.server";

export type Host = {
  hostName: string;
  recordType: string;
  address: string;
  ttl: string;
  [key: string]: string;
};

export const setHosts = async ({
  hosts,
  domain,
}: {
  domain: string;
  hosts: Host[];
}) => {
  const [sld, tld] = domain.split(".");
  const newUrl = hosts
    .map((h, i) => {
      console.log(`Processing host ${i + 1}: ${JSON.stringify(h)}`);
      return Object.entries(h)
        .map(([key, value]) => {
          console.log(`Processing key-value pair: ${key} = ${value}`);
          return `${key}${i + 1}=${value}`;
        })
        .join("&");
    })
    .join("&");
  console.log(`jFinal URL: ${newUrl}`);

  const hostsDataUrlBit = hosts
    .map(
      (h, i) =>
        `HostName${i + 1}=${h.hostName}&RecordType${i + 1}=${h.recordType}&Address${i + 1}=${h.address}&TTL${i + 1}=${h.ttl}`,
    )
    .join("&");
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.dns.setHosts&sld=${sld}&tld=${tld}&${hostsDataUrlBit}`;
  const newFullUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.dns.setHosts&sld=${sld}&tld=${tld}&${newUrl}`;
  console.log(`old url = ${apiUrl}`);
  console.log(`new full url = ${newFullUrl}`);
  const response = await fetch(newFullUrl, { method: "post" });
  await response.text();
};
