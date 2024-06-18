/* eslint-disable @typescript-eslint/no-explicit-any */
import { domain, mailbox } from "@prisma/client";
import { setIpv4ReverseDNS } from "backend/utils/bot/ipv4";
import { setIpv6ReverseDNS } from "backend/utils/bot/ipv6";
import { Host, setHosts } from "backend/utils/namecheap/setHosts";
import { Config as NodeSSHConfig, NodeSSH } from "node-ssh";
import puppeteer from "puppeteer";
import { env } from "~/api";
import { ComputeManager } from "~/lib/contabo";

export async function runBashCommands(
  props: NodeSSHConfig & {
    bashCommands: string[];
    scriptMode?: boolean;
  },
) {
  let retryCount = 0;
  const maxRetries = 6;
  const retryDelay = 20 * 1000; // 20 seconds
  const responses: string[] = [];

  const bashCommands = props.bashCommands;//.map(c => `sudo ${c}`);

  console.log("Starting to run bash commands");
  bashCommands.map((bc) => console.log(bc));
  while (retryCount <= maxRetries) {
    try {
      const ssh = new NodeSSH();
      console.log("Connecting via SSH");
      await ssh.connect(props);
      if (props.scriptMode) {
        await ssh.execCommand(`echo "#!/bin/bash" > script.sh `);
        for (const bc of bashCommands) {
          await ssh.execCommand(`echo "${bc}" >> script.sh `);
        }
        const { code, signal, stderr, stdout } =
          await ssh.execCommand(`bash ./script.sh`);
        console.log(
          `Command result - stdout: ${stdout}, stderr: ${stderr}, code: ${code}, signal: ${signal}`,
        );
        responses.push(stdout);
      } else {
        for (const bc of bashCommands) {
          console.log(`Executing command: ${bc}`);
          const { code, signal, stderr, stdout } = await ssh.execCommand(bc);
          console.log(
            `Command result - stdout: ${stdout}, stderr: ${stderr}, code: ${code}, signal: ${signal}`,
          );
          responses.push(stdout);
        }
      }
      ssh.dispose();
      console.log("SSH session disposed");
      return responses; // success, exit the retry loop
    } catch (e: any) {
      retryCount++;
      console.log(`Error encountered: ${e.message}`);

      if (retryCount <= maxRetries) {
        console.log(
          `Retry ${retryCount} of ${maxRetries} in ${retryDelay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error("Maximum retries exceeded. Giving up.");
        break;
      }
    }
  }
  return [];
}

export async function runEmailWizForTheFirstTime({
  host,
  username,
  password,
  port = 22,
}: {
  host: string;
  port: number;
  username: string;
  password: string;
}) {}

export async function enableIpv6({
  host,
  username,
  password,
  port = 22,
}: {
  host: string;
  port: number;
  username: string;
  password: string;
}) {
  console.log("About to enable IPV6: ", host);
  await runBashCommands({
    host,
    port,
    username,
    password,
    bashCommands: ["sudo enable_ipv6", "sudo reboot"],
  });
  console.log("Done. Sleeping for 1 minute.", host);
  await sleep(60 * 1000);
  console.log("I'm back", host);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function browserTest() {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://developer.chrome.com/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  await page.type(".devsite-search-field", "automate beyond recorder");

  // Wait and click on first result
  const searchResultSelector = ".devsite-result-item-link";
  await page.waitForSelector(searchResultSelector);
  await page.click(searchResultSelector);

  // Locate the full title with a unique string
  const textSelector = await page.waitForSelector(
    "text/Customize and automate",
  );
  const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // Print the full title
  console.log('The title of this blog post is "%s".', fullTitle);

  await browser.close();
}

function swapLast({ data, lastVal }: { data: string; lastVal: string }) {
  return data.slice(0, data.length - 1) + lastVal; //.map((d, i) =>;
}
export async function tieVPSAndDomain({
  contaboData,
  mailbox,
}: {
  contaboData: Awaited<ReturnType<typeof ComputeManager.getVPSInstanceData>>;
  mailbox: mailbox & { domain: domain };
}) {
  console.log("Tying VPS and domain for mailbox:", mailbox.id);
  // tie the contabo & namecheap pointers
  // point ipv4 -> domain
  console.log(`Setting IPv4 reverse DNS for domain ${mailbox.domain.name}`);
  await setIpv4ReverseDNS({
    ipv4: contaboData.data[0].ipConfig.v4.ip,
    username: env.CONTABO_ACCOUNT_USERNAME,
    password: env.CONTABO_ACCOUNT_PASSWORD,
    targetUrl: mailbox.domain.name,
  });

  // point ipv6 -> domain
  // console.log(`Setting IPv6 reverse DNS for domain ${mailbox.domain.name}`);
  await setIpv4ReverseDNS({
    ipv4: swapLast({
      data: contaboData.data[0].ipConfig.v6.ip,
      lastVal: "1",
    }),
    username: env.CONTABO_ACCOUNT_USERNAME,
    password: env.CONTABO_ACCOUNT_PASSWORD,
    targetUrl: mailbox.domain.name,
  });

  console.log(`Setting DNS hosts for domain ${mailbox.domain.name}`);
  await setHosts({
    domain: mailbox.domain.name,
    hosts: [
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "www",
        ttl:'60',
      },
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "@",
        ttl:'60',
      },
      {
        address: contaboData.data[0].ipConfig.v4.ip,
        recordType: "A",
        hostName: "mail",
        ttl:'60',
      },
      {
        address: contaboData.data[0].ipConfig.v6.ip,
        recordType: "AAAA",
        hostName: "@",
        ttl: '60',
      },
      {
        address: contaboData.data[0].ipConfig.v6.ip,
        recordType: "AAAA",
        hostName: "mail",
        ttl: '60',
      },
    ],
  });

  console.log(`sleeping for 1 minute`);
  await sleep(60 * 1000);
  console.log(`woke up`);
  console.log(`DNS hosts set for domain ${mailbox.domain.name}`);
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
  contaboData: Awaited<ReturnType<typeof ComputeManager.getVPSInstanceData>>;
  mailbox: mailbox & { domain: domain };
}) {
  console.log(`Initializing Emailwiz for domain ${mailbox.domain.name}`);
  console.log(
    `ssh ${env.CONTABO_VPS_LOGIN_USERNAME}@${contaboData.data[0].ipConfig.v4.ip}`,
  );

  const response = await runBashCommands({
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
  console.log(
    `Emailwiz setup response for domain ${mailbox.domain.name}:`,
    response?.at(-1),
  );
}

export async function postEmailwizPointers({
  contaboData,
  mailbox,
}: {
  contaboData: Awaited<ReturnType<typeof ComputeManager.getVPSInstanceData>>;
  mailbox: mailbox & { domain: domain };
}) {
  console.log("Fetching DNS Emailwiz data");
  const response = await runBashCommands({
    bashCommands: ["sudo cat /root/dns_emailwizard"],
    timeout: 3600 * 1000,
    username: env.CONTABO_VPS_LOGIN_USERNAME,
    password: env.CONTABO_VPS_LOGIN_PASSWORD,
    port: 22,
    host: contaboData.data[0].ipConfig.v4.ip,
    scriptMode: true,
  });
  console.log("DNS Emailwiz data fetched:", response);
  const dnsDataList = response[0].split("\n");
  console.log("DNS data list:", dnsDataList);
  const txtRecords = dnsDataList
    .filter((_, index) => index !== 0 && index !== dnsDataList.length - 1)
    .map((txtRecordString) => txtRecordString.split("\t"))
    .map((txtRecordMapping) => ({
      recordType: "TXT",
      hostName: txtRecordMapping[0].split(mailbox.domain.name)[0],
      address: encodeURIComponent(txtRecordMapping[2]),
      ttl: "60",
    }))
    .map((txtRecordMapping) => ({
      ...txtRecordMapping,
      hostName:
        txtRecordMapping.hostName.length === 0
          ? "@"
          : txtRecordMapping.hostName,
    }));
  console.log("TXT records parsed:", txtRecords);
  const mxRecord = [
    {
      address: "mail." + mailbox.domain.name,
      hostName: "@",
      ttl: "300",
      recordType: "MX",
      mxpref: "11",
      emailtype: "mx",
    },
  ];
  console.log("MX record set:", mxRecord);

  console.log("Setting hosts for domain:", mailbox.domain.name);
  await setHosts({
    domain: mailbox.domain.name,
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
        hostName: "@",
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
        hostName: "@",
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
  console.log("Hosts set successfully for domain:", mailbox.domain.name);
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
