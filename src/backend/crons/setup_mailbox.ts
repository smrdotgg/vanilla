import { mailbox } from "@prisma/client";
import { ContaboService } from "~/sdks/contabo";
import { setReverseDNS } from "~/sdks/contabo/bot/ipv4";

import { runBashCommands } from "~/sdks/contabo/helpers/run_bash_command";
import { setHosts } from "~/sdks/namecheap/functions/set_hosts";
import { consoleLog } from "~/utils/console_log";
import { prisma } from "~/utils/db";
import { env } from "~/utils/env";
import { sleep } from "~/utils/sleep";

export async function setupMailboxesCron() {
  const mailboxes = await prisma.mailbox.findMany({
    where: {
      // status: "PENDING",
      deletedAt: null,
    },
  });

  consoleLog(`Found ${mailboxes.length} mailboxes`);

  for (const mailbox of mailboxes) {
    consoleLog(
      `Processing mailbox [${mailbox.id}], ${mailbox.firstName}${
        mailbox.lastName ? ` ${mailbox.lastName}` : ""
      }, ${mailbox.username}@${mailbox.domainName}`
    );
    const domainName = mailbox.domainName.trim().toLowerCase();

    const domainStatus = await prisma.domain_dns_transfer.findFirst({
      where: {
        name: domainName,
      },
    });
    const domainIsValid = domainStatus?.success === true;
    if (!domainIsValid) {
      consoleLog(`Domain ${domainName} is not valid`);
      if (domainStatus === null) {
        consoleLog(`Domain ${domainName} not found in database`);
      } else if (domainStatus!.success === false) {
        consoleLog(`Domain is not configured properly: ${domainStatus!.note}`);
      }
      continue;
    } else {
      consoleLog(`Domain ${domainName} is valid`);
    }

    const vpsContaboId = await ContaboService.getOrCreateVPSAndGetId({
      mailboxId: mailbox.id,
    });

    consoleLog(`Got VPS Contabo ID: ${vpsContaboId}`);

    const contaboData = await ContaboService.getVPSInstanceData({
      id: String(vpsContaboId),
    });

    consoleLog(`Got Contabo data: ${JSON.stringify(contaboData, null, 2)}`);

    const vpsDataFromDB = (await prisma.vps.findFirst({
      where: { compute_id_on_hosting_platform: vpsContaboId },
    }))!;

    consoleLog(`Found VPS data in database: ${JSON.stringify(vpsDataFromDB)}`);

    if (!vpsDataFromDB.ipv6Enabled) {
      consoleLog(`Enabling IPv6 for VPS ${vpsContaboId}`);
      await ContaboService.enableIpv6({
        host: contaboData.data[0].ipConfig.v4.ip,
        username: env.CONTABO_VPS_LOGIN_USERNAME,
        password: env.CONTABO_VPS_LOGIN_PASSWORD,
        port: 22,
      });

      await prisma.vps.update({
        where: { id: vpsDataFromDB.id },
        data: { ipv6Enabled: true },
      });
      consoleLog(
        `Updated VPS data in database: ${JSON.stringify(vpsDataFromDB)}`
      );

    }

    if (!vpsDataFromDB.emailwizInitiated) {
      consoleLog(`Initializing Emailwiz for mailbox ${mailbox.id}`);
      // await tieVPSAndDomain({
      //   mailbox: { ...mailbox, domainName: mailbox.domainName! },
      //   contaboData,
      // });

      // consoleLog(`Sleeping for 1 minutes...`);
      // await sleep(1 * 60 * 1000);

      // consoleLog(`Initializing Emailwiz for mailbox ${mailbox.id}`);
      // await initializeEmailwiz({ mailbox, contaboData });

      consoleLog(`Posting Emailwiz pointers for mailbox ${mailbox.id}`);
      await postEmailwizPointers({
        mailbox: { ...mailbox, domainName: mailbox.domainName! },
        contaboData,
      });

      consoleLog(
        `Updated VPS data in database: ${JSON.stringify(vpsDataFromDB)}`
      );
      await prisma.vps.update({
        where: { id: vpsDataFromDB.id },
        data: { emailwizInitiated: true },
      });

    }

    if (mailbox.status === "PENDING") {
      consoleLog(`Adding user to VPS for mailbox ${mailbox.id}`);
      await addUserToVPS({
        ip: contaboData.data[0].ipConfig.v4.ip,
        password: mailbox.password,
        username: mailbox.username,
      });

      consoleLog(`Updated mailbox status to ADDED for mailbox ${mailbox.id}`);
      await prisma.mailbox.update({
        where: { id: mailbox.id },
        data: { status: "ADDED" },
      });
    }
  }

  consoleLog(`Setup mailboxes completed`);
}

//*******************************************************************//
//*******************************************************************//
//********************** HELPER FUNCTIONS ************************** //
//*******************************************************************//
//*******************************************************************//
async function postEmailwizPointers({
  contaboData,
  mailbox,
}: {
  contaboData: Awaited<ReturnType<typeof ContaboService.getVPSInstanceData>>;
  mailbox: mailbox & { domainName: string };
}) {
  consoleLog(`Posting Email Wizard pointers for ${mailbox.domainName}`);

  const response = await runBashCommands({
    bashCommands: ["sudo cat /root/dns_emailwizard"],
    timeout: 3600 * 1000,
    username: env.CONTABO_VPS_LOGIN_USERNAME,
    password: env.CONTABO_VPS_LOGIN_PASSWORD,
    port: 22,
    host: contaboData.data[0].ipConfig.v4.ip,
    scriptMode: true,
  });
  consoleLog(`Received response from bash command`);

  const dnsDataList = response[0].split("\n");
  const rawTxtRecords = dnsDataList
    .filter((_, index) => index !== 0 && index !== dnsDataList.length - 1)
    .map((txtRecordString) => txtRecordString.split("\t"));
  console.log(`Raw TXT records: ${rawTxtRecords}`);
  const txtRecords = rawTxtRecords.map((txtRecordMapping) => ({
    recordType: "TXT",
    hostName: txtRecordMapping[0].split(mailbox.domainName)[0],
    // address: encodeURIComponent(txtRecordMapping[2]),
    address: txtRecordMapping[2],
    ttl: "60",
  }));
  consoleLog(`Extracted TXT records: ${txtRecords.length}`);

  const mxRecord = [
    {
      address: "mail." + mailbox.domainName,
      hostName: "",
      ttl: "300",
      recordType: "MX",
      mxpref: "11",
      emailtype: "mx",
    },
  ];

  consoleLog(`Setting hosts for ${mailbox.domainName}`);
  await setHosts({
    domain: mailbox.domainName,
    hosts: [
      // {
      //   address: contaboData.data[0].ipConfig.v4.ip,
      //   recordType: "A",
      //   hostName: "www",
      //   ttl: "60",
      // },
      // {
      //   address: contaboData.data[0].ipConfig.v4.ip,
      //   recordType: "A",
      //   hostName: "",
      //   ttl: "60",
      // },
      // {
      //   address: contaboData.data[0].ipConfig.v6.ip,
      //   recordType: "AAAA",
      //   hostName: "",
      //   ttl: "60",
      // },
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "mail",
        ttl: "60",
      },
      {
        address: contaboData.data[0].ipConfig.v6.ip,
        recordType: "AAAA",
        hostName: "mail",
        ttl: "60",
      },
      ...txtRecords,
      ...mxRecord,
    ],
  });
  consoleLog(`Hosts set successfully for ${mailbox.domainName}`);
}

export async function addUserToVPS({
  ip,
  username,
  password,
}: {
  ip: string;
  username: string;
  password: string;
}) {
  await runBashCommands({
    bashCommands: [
      `sudo useradd -m ${username} -G mail`,
      `echo -e "${password}\\n${password}" | sudo passwd ${username}`,
    ],
    timeout: 3600 * 1000,
    username: env.CONTABO_VPS_LOGIN_USERNAME,
    password: env.CONTABO_VPS_LOGIN_PASSWORD,
    port: 22,
    host: ip,
    scriptMode: false,
  });
}

export async function initializeEmailwiz({
  contaboData,
  mailbox,
}: {
  contaboData: Awaited<ReturnType<typeof ContaboService.getVPSInstanceData>>;
  mailbox: mailbox;
}) {
  const script = ({ domain }: { domain: string }) => [
    `echo "postfix postfix/mailname string ${domain}" | sudo debconf-set-selections`,
    `echo "postfix postfix/main_mailer_type string 'Internet Site'" | sudo debconf-set-selections`,
    "sudo apt install git unzip -y",
    "sudo ./x.sh",
    // "git clone https://github.com/LukeSmithxyz/emailwiz.git",
    // "cd emailwiz",
    // "sudo chmod +x ./*.sh",
    // "sudo ./emailwiz.sh",
    // "cd ..",
    // "cat dns_emailwizard",
  ];
  await runBashCommands({
    bashCommands: script({
      domain: mailbox.domainName,
    }),
    timeout: 3600 * 1000,
    username: env.CONTABO_VPS_LOGIN_USERNAME,
    password: env.CONTABO_VPS_LOGIN_PASSWORD,
    port: 22,
    host: contaboData.data[0].ipConfig.v4.ip,
    scriptMode: true,
  });
}

function swapLast({ data, lastVal }: { data: string; lastVal: string }) {
  if (!data.length) throw new Error("data is empty");
  const splitted = data.split("");
  splitted.pop();
  splitted.push(lastVal);
  return splitted.join("");
}

export async function tieVPSAndDomain({
  contaboData,
  mailbox,
}: {
  contaboData: Awaited<ReturnType<typeof ContaboService.getVPSInstanceData>>;
  mailbox: mailbox & { domainName: string };
}) {
  consoleLog("Tying VPS and domain", mailbox.domainName);
  await setReverseDNS({
    ipv4: contaboData.data[0].ipConfig.v4.ip,
    username: env.CONTABO_ACCOUNT_USERNAME,
    password: env.CONTABO_ACCOUNT_PASSWORD,
    targetUrl: mailbox.domainName,
  });
  consoleLog("Tying VPS and domain done [ipv4]", mailbox.domainName);
  await setReverseDNS({
    ipv4: swapLast({
      data: contaboData.data[0].ipConfig.v6.ip,
      lastVal: "1",
    }),
    username: env.CONTABO_ACCOUNT_USERNAME,
    password: env.CONTABO_ACCOUNT_PASSWORD,
    targetUrl: mailbox.domainName,
  });
  consoleLog("Tying VPS and domain done [ipv6]", mailbox.domainName);

  await setHosts({
    domain: mailbox.domainName,
    hosts: [
      // {
      //   address: contaboData.data[0].ipConfig.v4.ip,
      //   recordType: "A",
      //   hostName: "www",
      //   ttl: "60",
      // },
      // {
      //   address: contaboData.data[0].ipConfig.v4.ip,
      //   recordType: "A",
      //   hostName: "",
      //   ttl: "60",
      // },
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "mail",
        ttl: "60",
      },
      // {
      //   address: contaboData.data[0].ipConfig.v6.ip,
      //   recordType: "AAAA",
      //   hostName: "",
      //   ttl: "60",
      // },
      {
        address: contaboData.data[0].ipConfig.v6.ip,
        recordType: "AAAA",
        hostName: "mail",
        ttl: "60",
      },
    ],
  });
  await sleep(60 * 1000);
}
