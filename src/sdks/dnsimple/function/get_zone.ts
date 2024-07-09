import { dnsimple } from "..";
import { env } from "~/utils/env";

export const getZone = async ({ domain }: { domain: string }) => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${env.DNSIMPLE_ACCESS_TOKEN}`);
  headers.append("Content-Type", "application/json");
  headers.append("Accept", "application/json");

  return fetch(
    `${env.DNSIMPLE_BASE_URL}/${env.DNSIMPLE_ACCOUNT_KEY}/zones/${domain}`,
    {
      headers,
    }
  )
    .then((r) => r.json() as ReturnType<typeof dnsimple.zones.getZone>)
    .catch(() => undefined);
};
