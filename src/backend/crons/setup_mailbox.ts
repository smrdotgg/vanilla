import { domain, mailbox } from "@prisma/client";
import { ContaboService } from "~/sdks/contabo";
import { setReverseDNS } from "~/sdks/contabo/bot/ipv4";

import { runBashCommands } from "~/sdks/contabo/helpers/run_bash_command";
import { setHosts } from "~/sdks/namecheap/functions/set_hosts";
import { prisma } from "~/utils/db";
import { env } from "~/utils/env";
import { sleep } from "~/utils/sleep";

export async function setupMailboxesCron() {
  const pendingMailboxes = await prisma.mailbox.findMany({
    where: {
      status: "PENDING",
    },
  });
  await setupMailboxes({ mailboxIds: pendingMailboxes.map((m) => m.id) });
}
async function setupMailboxes({ mailboxIds }: { mailboxIds: number[] }) {
  console.log(
    `Setup mailboxes started for mailbox IDs: ${mailboxIds.join(", ")}`
  );

  const mailboxes = await prisma.mailbox.findMany({
    where: { id: { in: mailboxIds } },
    include: { domain: { include: { vps: true } } },
  });

  console.log(`Found ${mailboxes.length} mailboxes`);

  for (const mailbox of mailboxes) {
    console.log(`Processing mailbox ${mailbox.id}`);
    if (!mailbox.domainName) {
      console.log(`Mailbox ${mailbox.id} has no domain, skipping`);
      continue;
    }

    if (mailbox.status === "ADDED") {
      console.log(`Mailbox ${mailbox.id} is already added, skipping`);
      continue;
    }

    const vpsContaboId = await ContaboService.getOrCreateVPSAndGetId({
      mailboxId: mailbox.id,
    });

    console.log(`Got VPS Contabo ID: ${vpsContaboId}`);

    const contaboData = await ContaboService.getVPSInstanceData({
      id: String(vpsContaboId),
    });

    console.log(`Got Contabo data: ${JSON.stringify(contaboData)}`);

    const vpsDataFromDB = await prisma.vps.findFirst({
      where: { compute_id_on_hosting_platform: vpsContaboId },
    });

    if (vpsDataFromDB === null) {
      console.error(`VPS data not found in database for mailbox ${mailbox.id}`);
      throw Error("VPS data not found in database.");
    }

    console.log(`Found VPS data in database: ${JSON.stringify(vpsDataFromDB)}`);

    if (!vpsDataFromDB.ipv6Enabled) {
      console.log(`Enabling IPv6 for VPS ${vpsContaboId}`);
      await ContaboService.enableIpv6({
        host: contaboData.data[0].ipConfig.v4.ip,
        username: env.CONTABO_VPS_LOGIN_USERNAME,
        password: env.CONTABO_VPS_LOGIN_PASSWORD,
        port: 22,
      });

      console.log(
        `Updated VPS data in database: ${JSON.stringify(vpsDataFromDB)}`
      );
      await prisma.vps.update({
        where: { id: vpsDataFromDB.id },
        data: { ipv6Enabled: true },
      });
    }

    if (!vpsDataFromDB.emailwizInitiated) {
      console.log(`Initializing Emailwiz for mailbox ${mailbox.id}`);
      await tieVPSAndDomain({
        mailbox: { ...mailbox, domainName: mailbox.domainName! },
        contaboData,
      });

      console.log(`Sleeping for 10 minutes...`);
      await sleep(10 * 60 * 1000);

      console.log(`Initializing Emailwiz for mailbox ${mailbox.id}`);
      await initializeEmailwiz({ mailbox, contaboData });

      console.log(`Posting Emailwiz pointers for mailbox ${mailbox.id}`);
      await postEmailwizPointers({
        mailbox: { ...mailbox, domainName: mailbox.domainName! },
        contaboData,
      });

      console.log(
        `Updated domain data in database: ${JSON.stringify(mailbox.domainId)}`
      );

      await prisma.domain.update({
        where: { id: mailbox.domainId },
        data: { vps_id: vpsDataFromDB.id },
      });

      console.log(
        `Updated VPS data in database: ${JSON.stringify(vpsDataFromDB)}`
      );
      await prisma.vps.update({
        where: { id: vpsDataFromDB.id },
        data: { emailwizInitiated: true },
      });
    }

    if (mailbox.status === "PENDING") {
      console.log(`Adding user to VPS for mailbox ${mailbox.id}`);
      await addUserToVPS({
        ip: contaboData.data[0].ipConfig.v4.ip,
        password: mailbox.password,
        username: mailbox.username,
      });

      console.log(`Updated mailbox status to ADDED for mailbox ${mailbox.id}`);
      await prisma.mailbox.update({
        where: { id: mailbox.id },
        data: { status: "ADDED" },
      });
    }
  }

  console.log(`Setup mailboxes completed`);
}

export async function postEmailwizPointers({
  contaboData,
  mailbox,
}: {
  contaboData: Awaited<ReturnType<typeof ContaboService.getVPSInstanceData>>;
  mailbox: mailbox & { domainName: string };
}) {
  const response = await runBashCommands({
    bashCommands: ["sudo cat /root/dns_emailwizard"],
    timeout: 3600 * 1000,
    username: env.CONTABO_VPS_LOGIN_USERNAME,
    password: env.CONTABO_VPS_LOGIN_PASSWORD,
    port: 22,
    host: contaboData.data[0].ipConfig.v4.ip,
    scriptMode: true,
  });
  const dnsDataList = response[0].split("\n");
  const txtRecords = dnsDataList
    .filter((_, index) => index !== 0 && index !== dnsDataList.length - 1)
    .map((txtRecordString) => txtRecordString.split("\t"))
    .map((txtRecordMapping) => ({
      recordType: "TXT",
      hostName: txtRecordMapping[0].split(mailbox.domainName)[0],
      address: encodeURIComponent(txtRecordMapping[2]),
      ttl: "60",
    }));
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

  await setHosts({
    domain: mailbox.domainName,
    hosts: [
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "www",
        ttl: "60",
      },
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "",
        ttl: "60",
      },
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "mail",
        ttl: "60",
      },
      {
        address: contaboData.data[0].ipConfig.v6.ip,
        recordType: "AAAA",
        hostName: "",
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

function swapLast({ data, lastVal }: { data: string; lastVal: string }) {
  return data.slice(0, data.length - 1) + lastVal; //.map((d, i) =>;
}

const script = ({ domain }: { domain: string }) => [
  `echo "postfix postfix/mailname string ${domain}" | sudo debconf-set-selections`,
  `echo "postfix postfix/main_mailer_type string 'Internet Site'" | sudo debconf-set-selections`,
  "sudo apt install git unzip -y",
  "git clone https://github.com/LukeSmithxyz/emailwiz.git",
  "cd emailwiz",
  "sudo chmod +x ./*.sh",
  "sudo ./emailwiz.sh",
  "cd ..",
  "cat dns_emailwizard",
];

export async function initializeEmailwiz({
  contaboData,
  mailbox,
}: {
  contaboData: Awaited<ReturnType<typeof ContaboService.getVPSInstanceData>>;
  mailbox: mailbox & { domain: domain };
}) {
  await runBashCommands({
    bashCommands: script({
      domain: mailbox.domain.name,
    }),
    timeout: 3600 * 1000,
    username: env.CONTABO_VPS_LOGIN_USERNAME,
    password: env.CONTABO_VPS_LOGIN_PASSWORD,
    port: 22,
    host: contaboData.data[0].ipConfig.v4.ip,
    scriptMode: true,
  });
}

export async function tieVPSAndDomain({
  contaboData,
  mailbox,
}: {
  contaboData: Awaited<ReturnType<typeof ContaboService.getVPSInstanceData>>;
  mailbox: mailbox & { domainName: string };
}) {
  await setReverseDNS({
    ipv4: contaboData.data[0].ipConfig.v4.ip,
    username: env.CONTABO_ACCOUNT_USERNAME,
    password: env.CONTABO_ACCOUNT_PASSWORD,
    targetUrl: mailbox.domainName,
  });

  await setReverseDNS({
    ipv4: swapLast({
      data: contaboData.data[0].ipConfig.v6.ip,
      lastVal: "1",
    }),
    username: env.CONTABO_ACCOUNT_USERNAME,
    password: env.CONTABO_ACCOUNT_PASSWORD,
    targetUrl: mailbox.domainName,
  });

  await setHosts({
    domain: mailbox.domainName,
    hosts: [
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "www",
        ttl: "60",
      },
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "",
        ttl: "60",
      },
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "mail",
        ttl: "60",
      },
      {
        address: contaboData.data[0].ipConfig.v6.ip,
        recordType: "AAAA",
        hostName: "",
        ttl: "60",
      },
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
