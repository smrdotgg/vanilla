import { env } from "~/utils/env";
import { consoleLog } from "~/utils/console_log";

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

const getDomainRecords = ({ domain }: { domain: string }) =>
  fetch(
    `${env.CLOUDNS_BASE_URL}/dns/records.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}`
  )
    .then((r) => r.json() as Promise<DNSRecords>)
    .then((rl) => Object.values(rl));

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

const addRecord = ({ domain, record }: { domain: string; record: Host }) =>
  fetch(
    `${env.CLOUDNS_BASE_URL}/dns/add-record.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}&record-type=${record.recordType}&host=${record.hostName}&record=${record.address}&ttl=${record.ttl}&priority=10`
  )
    .then((r) => r.json())
    .then((r) => r.data as { id: number } | undefined);

export const DnsimpleService = {
  getDomainRecords,
  addRecord,
  deleteRecord,
  getZone,
  addZone,
};
