import { env } from "~/utils/env";

export const setHosts = async ({
  hosts,
  domain,
}: {
  domain: string;
  hosts: Host[];
}) => {
  let zone = await getZone({ domain });
  if (!zone) {
    const result = await addZone({ domain });
    if (result.status === "Failed") {
      throw Error(result.statusDescription);
    }
    zone = await getZone({ domain });
  }

  const records = await fetch(
    `${env.CLOUDNS_BASE_URL}/dns/records.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}`
  )
    .then((r) => r.json() as Promise<DNSRecords>)
    .then((rl) =>
      Object.fromEntries(
        Object.entries(rl).filter(([, value]) => value.type !== "NS")
      )
    );

  // delete all records
  const recordIds = Object.entries(records).map(([, v]) => v.id);
  const results = await Promise.all(
    recordIds.map((id) => deleteRecord({ recordId: id }))
  );
  if (results.some((r) => !r.ok)) {
    throw new Error("Failed to delete records");
  }

  // add records
  const addRecordResponses = await Promise.all(
    hosts.map((host) => addRecord({ record: host, domain }))
  );
  if (addRecordResponses.some((r) => r === undefined)) {
    throw new Error("Failed to add records");
  }
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
  return await fetch(
    `${env.CLOUDNS_BASE_URL}/dns/get-zone-info.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}`
  )
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

const addZone = async ({ domain }: { domain: string }) =>
  await fetch(
    `${env.CLOUDNS_BASE_URL}/dns/register.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}&zone-type=master`
  ).then(
    (r) =>
      r.json() as Promise<{
        status: "Success" | "Failed";
        statusDescription: string;
      }>
  );

const deleteRecord = ({ recordId }: { recordId: string }) =>
  fetch(
    `${env.CLOUDNS_BASE_URL}/dns/delete-record.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&record-id=${recordId}`
  );

const addRecord = ({ domain, record }: { domain: string; record: Host }) =>
  fetch(
    `${env.CLOUDNS_BASE_URL}/dns/add-record.json?auth-id=${env.CLOUDNS_ID}&auth-password=${env.CLOUDNS_PASS}&domain-name=${domain}&record-type=${record.recordType}&host=${record.hostName}&record=${record.address}&ttl=${record.ttl}&priority=10`
  )
    .then((r) => r.json())
    .then((r) => r.data as { id: number } | undefined);
