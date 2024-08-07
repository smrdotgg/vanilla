import { ContaboService } from "~/sdks/contabo";

import { tieVPSAndDomain, initializeEmailwiz } from "./setup_mailbox.helpers";
import { setHosts } from "~/sdks/namecheap/functions/set_hosts";
import { consoleLog } from "~/utils/console_log";
import { prisma } from "~/utils/db";
import { env } from "~/utils/env";
import { sleep } from "~/utils/sleep";
import { getPostEmailwizPointers } from "../helpers/getPostEmailwizPointers";
import { prefixPlusDomain } from "../helpers/prefix_plus_domain";
import { checkForErrors } from "../helpers/catch_errors";

export async function setupMailboxesCron() {
  const mailboxConfigs = await prisma.mailbox_config.findMany({
    where: { deletedAt: null },
    include: { domain: true },
  });
  const mailDomainsNames: {
    coreDomain: string;
    prefix: string;
    fullDomain: string;
  }[] = [];
  for (const mailboxConfig of mailboxConfigs) {
    const prefix = mailboxConfig.domainPrefix.length
      ? `${mailboxConfig.domainPrefix}.`
      : "";
    const fullDomain = `${prefix}${mailboxConfig.domain.name}`;
    if (
      mailDomainsNames.findIndex((val) => val.fullDomain === fullDomain) === -1
    ) {
      mailDomainsNames.push({
        fullDomain,
        prefix,
        coreDomain: mailboxConfig.domain.name,
      });
    }
  }

  const problematicMailDomains = await prisma.domain_email_status.findMany({
    where: {
      OR: [
        { vpsAssigned: false },
        { vpsStatus: "DOWN" },
        { ipv6Enabled: false },
        { mailDotDomainSetToPointToMachineIp: false },
        { mailDotDomainActuallyPointsToMachineIp: false },
        { emailSoftwareSetUp: false },
        { emailAuthPointersSetToPointCorrectly: false },
        { emailAuthPointersActuallyPointCorrectly: false },
      ],
      domainPrefix: {
        in: mailDomainsNames.map((mdn) => mdn.prefix),
      },
      coreDomain: {
        in: mailDomainsNames.map((mdn) => mdn.coreDomain),
      },
    },
  });

  consoleLog(`Found ${mailboxConfigs.length} mailboxes`);

  for (const problematicDomain of problematicMailDomains) {
    const mailboxDomain = prefixPlusDomain(
      problematicDomain.domainPrefix,
      problematicDomain.coreDomain
    );

    // verify lack of VPS
    const vps = await prisma.vps.findFirst({
      where: {
        domain: prefixPlusDomain(
          problematicDomain.domainPrefix,
          problematicDomain.coreDomain
        ),
      },
    });
    if (!(vps && problematicDomain.vpsAssigned)) {
      await ContaboService.getOrCreateVPSAndGetId({
        mailboxDomain,
      });
      problematicDomain.vpsAssigned = true;
      continue;
    }

    const contaboData = await ContaboService.getVPSInstanceData({
      id: String(vps.compute_id_on_hosting_platform),
    });

    if (problematicDomain.vpsStatus === "DOWN") {
      // wake up vps somehow
    }
    if (problematicDomain.ipv6Enabled === false) {
      await checkForErrors(() =>
        ContaboService.enableIpv6({
          host: contaboData.data[0].ipConfig.v4.ip,
          username: env.CONTABO_VPS_LOGIN_USERNAME,
          password: env.CONTABO_VPS_LOGIN_PASSWORD,
          port: 22,
        })
      );
      problematicDomain.ipv6Enabled = true;
    }
    if (problematicDomain.mailDotDomainSetToPointToMachineIp === false) {
      await tieVPSAndDomain({
        mailboxDomain,
        ipv4: contaboData.data[0].ipConfig.v4.ip,
        ipv6: contaboData.data[0].ipConfig.v6.ip,
      });
      await sleep(1 * 60 * 1000);
      problematicDomain.mailDotDomainSetToPointToMachineIp = true;
    }

    if (problematicDomain.mailDotDomainActuallyPointsToMachineIp === false) {
      await tieVPSAndDomain({
        mailboxDomain,
        ipv4: contaboData.data[0].ipConfig.v4.ip,
        ipv6: contaboData.data[0].ipConfig.v6.ip,
      });
      await sleep(1 * 60 * 1000);
    }

    if (problematicDomain.emailSoftwareSetUp === false) {
      await initializeEmailwiz({
        ip: contaboData.data[0].ipConfig.v4.ip,
        mailboxDomain,
      });

      const postEmailwizHosts = await getPostEmailwizPointers({
        mailboxDomain,
        sshHost: contaboData.data[0].ipConfig.v4.ip,
        sshUsername: contaboData.data[0].defaultUser,
      });

      await setHosts({
        domain: mailboxDomain,
        removeExistingRecords: false,
        hosts: postEmailwizHosts,
      });
    }
    if (problematicDomain.emailAuthPointersSetToPointCorrectly === false) {
      const postEmailwizHosts = await getPostEmailwizPointers({
        mailboxDomain,
        sshHost: contaboData.data[0].ipConfig.v4.ip,
        sshUsername: contaboData.data[0].defaultUser,
      });

      await setHosts({
        domain: mailboxDomain,
        removeExistingRecords: false,
        hosts: postEmailwizHosts,
      });
    }

    if (problematicDomain.emailAuthPointersActuallyPointCorrectly === false) {
      const postEmailwizHosts = await getPostEmailwizPointers({
        mailboxDomain,
        sshHost: contaboData.data[0].ipConfig.v4.ip,
        sshUsername: contaboData.data[0].defaultUser,
      });

      await setHosts({
        domain: mailboxDomain,
        removeExistingRecords: false,
        hosts: postEmailwizHosts,
      });
    }
  }

  consoleLog(`Setup mailboxes completed`);
}
