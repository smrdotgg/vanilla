import { DnsimpleService } from "~/sdks/dnsimple";
import { consoleError, consoleLog } from "~/utils/console_log";
import { env } from "~/utils/env";

export const setHosts = async ({
  hosts,
  domain,
}: {
  domain: string;
  hosts: Host[];
}) => {
  hosts = hosts.map((host) => {
    return {
      ...host,
      hostName: host.hostName.endsWith(".")
        ? host.hostName.slice(0, host.hostName.length - 1)
        : host.hostName,
    };
  });

  consoleLog(`Setting hosts for domain ${domain} with ${hosts.length} hosts`);
  consoleLog(hosts);

  // const val: {[key: string]:number} = Object.entries(hosts).map(([k,v]) => [k,v])

  // consoleLog(`Setting hosts for domain ${domain}`);

  let zone = await getZone({ domain });
  if (!zone) {
    consoleLog(`Zone not found, creating new zone for ${domain}`);
    const result = await addZone({ domain });
    if (result.status === "Failed") {
      consoleError(`Failed to create zone: ${result.statusDescription}`);
      throw Error(result.statusDescription);
    }
    zone = await getZone({ domain });
  }

  consoleLog(`Fetching DNS records for ${domain}`);
  const records = (
    await DnsimpleService.getDomainRecords({ domain })
  ).filter((r) => r.type !== "NS");

  consoleLog(`Deleting existing records for ${domain}`);
  const recordList = Object.entries(records).map(([, v]) => v);
  consoleLog(`Records: ${JSON.stringify(recordList, null, 2)}`);

  for (const record of recordList) {
    const result = await deleteRecord({ recordId: record.id, domain });
    if (!result) {
      consoleError(
        `Failed to add record for ${JSON.stringify(record, null, 2)}`
      );
      throw new Error("Failed to add record");
    } else {
      console.log(await result.text());
    }
  }

  consoleLog(`Adding new records for ${domain}`);
  for (const host of hosts) {
    const result = await addRecord({ record: host, domain });
    if (!result) {
      consoleError(`Failed to add record for ${JSON.stringify(host, null, 2)}`);
      throw new Error("Failed to add record");
    }
  }
  const addRecordResponses = await Promise.all(
    hosts.map((host) => addRecord({ record: host, domain }))
  );
  if (addRecordResponses.some((r) => r === undefined)) {
    const index = addRecordResponses.findIndex((r) => r === undefined);
    const errorRecord = hosts[index];
    consoleError(`Failed to add record for ${JSON.stringify(errorRecord)}`);
    throw new Error(`Failed to add record for ${errorRecord}`);
  }
  consoleLog(`Hosts set successfully for ${domain}`);
  return;
};

type Host = {
  hostName: string;
  recordType: string;
  address: string;
  ttl: string;
  [key: string]: string;
};

type DNSRecords = {
  [key: string]: {
    id: string;
    type: string;
    host: string;
    record: string;
    failover: string;
    ttl: string;
    status: number;
  };
};

const getZone = async ({ domain }: { domain: string }) => {
  const url = `${env.CLOUDNS_BASE_URL}/dns/get-zone-info.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}`;
  consoleLog(`Fetching zone info for ${domain} from ${url}`);
  return await fetch(url)
    .then((r) => r.json())
    .then((r) =>
      r.name
        ? (r as {
            name: string;
            type: string;
            zone: string;
          })
        : undefined
    );
};

const addZone = ({ domain }: { domain: string }) =>
  fetch(
    `${env.CLOUDNS_BASE_URL}/dns/register.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}&zone-type=master`
  ).then(
    (r) =>
      r.json() as Promise<{
        status: "Success" | "Failed";
        statusDescription: string;
      }>
  );

const deleteRecord = ({
  domain,
  recordId,
}: {
  domain: string;
  recordId: string;
}) =>
  fetch(
    `${env.CLOUDNS_BASE_URL}/dns/delete-record.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&record-id=${recordId}&domain-name=${domain}`
  );

const addRecord = ({ domain, record }: { domain: string; record: Host }) => {
  console.log(`Adding record: ${JSON.stringify(record, null, 2)}`);
  return fetch(
    `${env.CLOUDNS_BASE_URL}/dns/add-record.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}&record-type=${record.recordType}&host=${record.hostName}&record=${record.address}&ttl=${record.ttl}&priority=10`
  )
    .then((r) => r.json())
    .then((r) => r.data as { id: number } | undefined);
};
