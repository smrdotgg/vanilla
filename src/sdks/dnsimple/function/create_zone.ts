import { env } from "~/utils/env";
import { dnsimple } from "..";

export const createZone = async ({ domain }: { domain: string }) => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${env.DNSIMPLE_ACCESS_TOKEN}`);
  headers.append("Content-Type", "application/json");
  headers.append("Accept", "application/json");

  //
  //     -d '<json>' \
  //
  //     
  //     https://api.dnsimple.com/v2/1385/domains

  dnsimple.zones.createZoneRecord

  // dnsimple.zones.create

  console.log(await fetch(`${env.DNSIMPLE_BASE_URL}/${env.DNSIMPLE_ACCOUNT_KEY}/vanity/${domain}`, {
    method: "PUT",
    headers,
    // body: JSON.stringify(['example.net']),
  }).then((r) => r.json()));
  return fetch(`${env.DNSIMPLE_BASE_URL}/${env.DNSIMPLE_ACCOUNT_KEY}/registrar/domains/${domain}/delegation/vanity`, {
    method: "PUT",
    headers,
    body: JSON.stringify(['example.net']),
  }).then((r) => r.json());
};

console.log(await createZone({ domain: "example.com" }));
