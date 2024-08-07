import { runBashCommands } from "~/sdks/contabo/helpers/run_bash_command";
import { env } from "~/utils/env";

export const getPostEmailwizPointers = async ({
  sshHost,
  mailboxDomain,
  sshUsername,
}: {
  sshHost: string;
  mailboxDomain: string;
  sshUsername:string;
}) => {
  const response = await runBashCommands({
    port: 22,
    host: sshHost,
    scriptMode: true,
    timeout: 3600 * 10,
    username: sshUsername,
    password: env.CONTABO_VPS_LOGIN_PASSWORD,
    bashCommands: ["sudo cat /root/dns_emailwizard"],
  });
  const dnsDataList = response[0].split("\n");
  const rawTxtRecords = dnsDataList
    .filter((_, index) => index !== 0 && index !== dnsDataList.length - 1)
    .map((txtRecordString) => txtRecordString.split("\t"));
  console.log(`Raw TXT records: ${rawTxtRecords}`);
  const txtRecords = rawTxtRecords.map((txtRecordMapping) => ({
    ttl: "60",
    recordType: "TXT",
    address: txtRecordMapping[2],
    hostName: removeLastDotIfPresent(txtRecordMapping[0].split(mailboxDomain)[0]),
  }));

  const mxRecord = [
    {
      ttl: "300",
      recordType: "MX",
      address: "mail." + mailboxDomain,
      hostName: "",
    },
  ];
  return [...txtRecords, ...mxRecord].map((r) => ({
    recordType: r.recordType.toUpperCase().trim(),
    hostName: r.hostName.trim().toLowerCase(),
    address: r.address.trim(),//.toLowerCase(),
    ttl: r.ttl.toUpperCase().trim(),
  }));
};

const removeLastDotIfPresent = (str: string) => {
  return str.endsWith(".") ? str.slice(0, -1) : str;
}
