import { ContaboService } from "~/sdks/contabo";
import {
  prefixPlusDomain,
  dnsLookup,
  ipv6AreEqual,
} from "./mailbox_check.helpers";
import { DnsimpleService } from "~/sdks/dnsimple";
import { prisma } from "~/utils/db";
import dns from "dns";
import { runBashCommands } from "~/sdks/contabo/helpers/run_bash_command";
import { getPostEmailwizPointers } from "../helpers/getPostEmailwizPointers";
import { env } from "~/utils/env";

export const MailboxCheckCron = async () => {
  const mailboxConfigs = await prisma.mailbox_config.findMany({
    where: { deletedAt: null },
    include: { domain: true },
  });
  const mailDomains: {
    coreDomain: string;
    prefix: string;
    fullDomain: string;
  }[] = [];
  for (const mailboxConfig of mailboxConfigs) {
    console.log(`mailboxConfig = ${JSON.stringify(mailboxConfig)}`);
    console.log(`mailDomains = ${JSON.stringify(mailDomains)}`);

    const prefix = mailboxConfig.domainPrefix.length
      ? `${mailboxConfig.domainPrefix}.`
      : "";

    const fullDomain = `${prefix}${mailboxConfig.domain.name}`;

    if (mailDomains.findIndex((val) => val.fullDomain === fullDomain) === -1) {
      mailDomains.push({
        fullDomain,
        prefix,
        coreDomain: mailboxConfig.domain.name,
      });
    }
  }
  console.log(`mail domains :: ${JSON.stringify(mailDomains)}`);

  for (const currentMailDomain of mailDomains) {
    console.log(`current mail domain = ${currentMailDomain}`);
    const vps = await prisma.vps.findFirst({
      where: { domain: currentMailDomain.fullDomain },
    });

    if (!vps) {
      const data = {
        vpsStatus: "DOWN" as const,
        vpsAssigned: false,
        emailSoftwareSetUp: false,
        mailDotDomainSetToPointToMachineIp: false,
        emailAuthPointersSetToPointCorrectly: false,
        mailDotDomainActuallyPointsToMachineIp: false,
        emailAuthPointersActuallyPointCorrectly: false,
        ipv6Enabled: false,
        coreDomain: currentMailDomain.coreDomain,
        domainPrefix: currentMailDomain.prefix,
      };
      const currentStatus = await prisma.domain_email_status.findFirst({
        where: {
          coreDomain: currentMailDomain.coreDomain,
          domainPrefix: currentMailDomain.prefix,
        },
      });
      if (currentStatus === null) {
        await prisma.domain_email_status.create({
          data,
        });
      } else {
        await prisma.domain_email_status.update({
          where: { id: currentStatus.id },
          data,
        });
      }
      continue;
    }

    const contaboData = await ContaboService.getVPSInstanceData({
      id: vps.compute_id_on_hosting_platform,
    }).then((r) => r.data[0]);

    const ipv4 = contaboData.ipConfig.v4.ip;
    const ipv6 = contaboData.ipConfig.v6.ip;

    const vpsStatus: "UP" | "DOWN" =
      contaboData.status === "running" ? "UP" : ("DOWN" as const);

    const dnsRecords = await DnsimpleService.getDomainRecords({
      // domain: currentMailDomain
      domain: currentMailDomain.coreDomain,
    });

    console.log("dnsRecords");
    console.log(JSON.stringify(dnsRecords, null, 2));
    const mailDotDomainPointsToMachineIPV4 = dnsRecords.find((dnsDatum) => {
      return (
        dnsDatum.host ===
          `mail${
            currentMailDomain.prefix.length
              ? `.${currentMailDomain.prefix}`
              : ``
          }` &&
        dnsDatum.type.toUpperCase() === "A" &&
        dnsDatum.record === contaboData.ipConfig.v4.ip
      );
    });
    const mailDotDomainPointsToMachineIPV6 = dnsRecords.find((dnsDatum) => {
      return (
        dnsDatum.host ===
          `mail${
            currentMailDomain.prefix.length
              ? `.${currentMailDomain.prefix}`
              : ``
          }` &&
        dnsDatum.type.toUpperCase() === "AAAA" &&
        dnsDatum.record === contaboData.ipConfig.v6.ip
      );
    });

    const mailDotDomainPointsToMachineAccordingToDNS =
      Boolean(mailDotDomainPointsToMachineIPV4) &&
      Boolean(mailDotDomainPointsToMachineIPV6);
    console.log(
      `Looking for dnsDatum.host to equal mail.${currentMailDomain.prefix}`
    );
    console.log(
      `Boolean(${mailDotDomainPointsToMachineIPV4}) && Boolean(${mailDotDomainPointsToMachineIPV6}) === ${mailDotDomainPointsToMachineAccordingToDNS}`
    );

    const val = await dnsLookup({
      domain: `mail.${currentMailDomain.fullDomain}`,
      mode: "IPv4",
    });
    const mailDotDomainPointsToMachineReallyIPV4 = val === ipv4;

    console.log(
      `mail.${currentMailDomain.fullDomain} set to point to ${val} but should point to ${ipv4}`
    );
    console.log(
      `mail.${currentMailDomain.fullDomain} points to ${val} but should point to ${ipv4}`
    );
    console.log(mailDotDomainPointsToMachineReallyIPV4);

    const val6 = await dnsLookup({
      domain: `mail.${currentMailDomain.fullDomain}`,
      mode: "IPv6",
    });
    const mailDotDomainPointsToMachineReallyIPV6 = ipv6AreEqual(
      val6 ?? "",
      ipv6
    );
    console.log(
      `mail.${currentMailDomain.fullDomain} points to ${val6} but should point to ${ipv6}`
    );
    console.log(mailDotDomainPointsToMachineReallyIPV6);

    const mailDotDomainPointsToMachineReally =
      mailDotDomainPointsToMachineReallyIPV4 &&
      mailDotDomainPointsToMachineReallyIPV6;

    // - Emailwiz installed and set up (check for artifacts)

    const smtpProcessIsRunning = await runBashCommands({
      bashCommands: ["pidof smtpd"],
      timeout: 3600 * 1000,
      username: contaboData.defaultUser,
      password: env.CONTABO_VPS_LOGIN_PASSWORD,
      host: ipv4,
      scriptMode: false,
    }).then((r) => r.length !== 0);
    const emailWizInitiatedVerified = smtpProcessIsRunning;

    const postEmailwizRecords = await getPostEmailwizPointers({
      sshHost: ipv4,
      mailboxDomain: currentMailDomain.fullDomain,
      sshUsername: contaboData.defaultUser,
    });

    let postEmailWizSetCorrectlyOnDNSSettings = true;

    for (const pointerSet of postEmailwizRecords) {
      console.log(
        `Checking pointer set: ${pointerSet.hostName} - ${pointerSet.recordType}`
      );

      const recordsOfInterest = dnsRecords.filter(
        (rec) =>
          pointerSet.hostName.trim().toLowerCase() ===
            rec.host.trim().toLowerCase() &&
          pointerSet.recordType.trim().toLowerCase() ===
            rec.type.trim().toLowerCase()
      );
      // console.log(`Records of interest: ${JSON.stringify(recordsOfInterest)}`);
      const recordOfInterest = recordsOfInterest.at(-1);

      if (recordOfInterest) {
        console.log(
          `Found record for ${pointerSet.hostName}: ${recordOfInterest.host} - ${recordOfInterest.type}`
        );
        if (
          recordOfInterest.record.trim().toLowerCase() !==
          pointerSet.address.trim().toLowerCase()
        ) {
          console.error(
            `Record value mismatch for ${pointerSet.hostName}.\nExpected:\n${pointerSet.address},\nActual:\n${recordOfInterest.record}\n\n`
          );
          postEmailWizSetCorrectlyOnDNSSettings = false;
          break;
        } else {
          console.log(
            `Record value matches for ${pointerSet.hostName}: ${pointerSet.address}`
          );
        }
      } else {
        console.warn(
          `No record found for ${pointerSet.hostName} - ${pointerSet.recordType}`
        );
      }
    }

    let postEmailWizSetCorrectlyOnDNSVerified = true;
    for (const pointerSet of postEmailwizRecords) {
      const mailboxFullDomain = currentMailDomain.fullDomain;
      const emailWizDomain = prefixPlusDomain(
        pointerSet.hostName,
        mailboxFullDomain
      );

      if (pointerSet.recordType === "TXT") {
        const isValid = await dns.promises
          .resolveTxt(emailWizDomain)
          .then((r) => r.flat())
          .then((r) => r.includes(pointerSet.address))
          .catch(() => undefined);
        if (!isValid) {
          postEmailWizSetCorrectlyOnDNSVerified = false;
          break;
        }
      } else if (pointerSet.recordType === "MX") {
        const isValid = await dns.promises
          .resolveMx(mailboxFullDomain)
          .then((r) =>
            r.findIndex(
              (mx) => mx.exchange.trim().toLowerCase() === pointerSet.address
            )
          )
          .then((r) => r !== -1)
          .catch(() => undefined);
        if (!isValid) {
          postEmailWizSetCorrectlyOnDNSVerified = false;
          break;
        }
      }
    }

    const data = {
      vpsStatus: vpsStatus,
      emailSoftwareSetUp: emailWizInitiatedVerified,
      mailDotDomainSetToPointToMachineIp:
        mailDotDomainPointsToMachineAccordingToDNS,
      emailAuthPointersSetToPointCorrectly:
        postEmailWizSetCorrectlyOnDNSSettings,
      mailDotDomainActuallyPointsToMachineIp:
        mailDotDomainPointsToMachineReally,
      emailAuthPointersActuallyPointCorrectly:
        postEmailWizSetCorrectlyOnDNSVerified,
      vpsAssigned: true,
      ipv6Enabled: false,
      coreDomain: currentMailDomain.coreDomain,
      domainPrefix: currentMailDomain.prefix,
    };

    const currentStatus = await prisma.domain_email_status.findFirst({
      where: {
        coreDomain: currentMailDomain.coreDomain,
        domainPrefix: currentMailDomain.prefix,
      },
    });

    if (currentStatus === null) {
      await prisma.domain_email_status.create({
        data,
      });
    } else {
      await prisma.domain_email_status.update({
        where: { id: currentStatus.id },
        data,
      });
    }
  }
};
