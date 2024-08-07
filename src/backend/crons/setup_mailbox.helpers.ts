import { setReverseDNS } from "~/sdks/contabo/bot/ipv4";

import { runBashCommands } from "~/sdks/contabo/helpers/run_bash_command";
import { setHosts } from "~/sdks/namecheap/functions/set_hosts";
import { consoleLog } from "~/utils/console_log";
import { env } from "~/utils/env";
import { sleep } from "~/utils/sleep";

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
  ip,
  mailboxDomain,
}: {
  ip: string;
  mailboxDomain: string;
}) {
  const script = ({ domain }: { domain: string }) => [
    `echo "postfix postfix/mailname string ${domain}" | sudo debconf-set-selections`,
    `echo "postfix postfix/main_mailer_type string 'Internet Site'" | sudo debconf-set-selections`,
    "sudo apt install git unzip -y",
    "git clone https://github.com/smrdotgg/emailwiz.git",
    "cd emailwiz",
    "sudo chmod +x ./*.sh",
    "sudo ./emailwiz.sh",
    "cd ..",
    "cat dns_emailwizard",
  ];
  await runBashCommands({
    bashCommands: script({
      domain: mailboxDomain,
    }),
    timeout: 3600 * 1000,
    username: env.CONTABO_VPS_LOGIN_USERNAME,
    password: env.CONTABO_VPS_LOGIN_PASSWORD,
    port: 22,
    host: ip,
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
  ipv4,
  ipv6,
  mailboxDomain,
}: {
  ipv4: string;
  ipv6: string;
  mailboxDomain: string;
}) {
  consoleLog("Tying VPS and domain", mailboxDomain);
  await setReverseDNS({
    ipv4,
    username: env.CONTABO_ACCOUNT_USERNAME,
    password: env.CONTABO_ACCOUNT_PASSWORD,
    targetUrl: mailboxDomain,
  });
  consoleLog("Tying VPS and domain done [ipv4]", mailboxDomain);
  await setReverseDNS({
    ipv4: swapLast({
      data: ipv6,
      lastVal: "1",
    }),
    username: env.CONTABO_ACCOUNT_USERNAME,
    password: env.CONTABO_ACCOUNT_PASSWORD,
    targetUrl: mailboxDomain,
  });
  consoleLog("Tying VPS and domain done [ipv6]", mailboxDomain);

  await setHosts({
    domain: mailboxDomain,
    hosts: [
      {
        address: ipv4,
        recordType: "A",
        hostName: "mail",
        ttl: "60",
      },
      {
        address: ipv6,
        recordType: "AAAA",
        hostName: "mail",
        ttl: "60",
      },
    ],
  });
  await sleep(60 * 1000);
}
