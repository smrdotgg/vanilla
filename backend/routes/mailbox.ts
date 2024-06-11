import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "~/db/prisma";
import { ComputeManager, getVPSInstanceData } from "~/lib/contabo";
import { browserTest, enableIpv6 } from "./mailbox.helpers";
import { env } from "~/api";

export const mailboxRoute = new Hono();

mailboxRoute.get("/", async (c) => {
  await browserTest();
  return c.json({ hello: "WWW" });
});

mailboxRoute.post("/setupMailBoxes", async (c) => {
  const requestJson = await c.req.json();
  const mailboxIds = requestJson["mailboxIds"];
  const parsedMailboxIds = z.array(z.number()).parse(mailboxIds);

  const mailboxes = await prisma.mailbox.findMany({
    where: { id: { in: parsedMailboxIds } },
    include: { domain: { include: { vps: true } } },
  });

  for (const mailbox of mailboxes) {
    if (mailbox.status === "ADDED") {
      continue;
    } else if (mailbox.status === "PENDING") {
      const hasVps = mailbox.domain.vps !== null;

      // if it has a VPS, then the user needs to be added to linux system
      if (hasVps) {
        // const vpsDataFromContabo = await getVPSInstanceData({id: String(mailbox.domain.vps!.id)})
        //
      } else {
        // see if we have any vps's in the database
        const freeVps = await prisma.vps.findFirst({
          where: { domain: { none: {} } },
        });
        // we have one, let's use it
        if (freeVps !== null) {
          // enable ipv6 & reboot
          // tie the contabo & namecheap pointers
          // run emailwiz
          // configure post-script pointers
          if (!freeVps.ipv6Enabled) {
            const contaboData = await ComputeManager.getVPSInstanceData({
              id: String(freeVps.id),
            });
            await enableIpv6({
              host: contaboData.data[0].ipConfig.v4.ip,
              username: env.CONTABO_API_USERNAME,
              password: env.CONTABO_API_PASSWORD,
              port: 22,
            });
            await prisma.vps.update({
              where: { id: freeVps.id },
              data: { ipv6Enabled: true },
            });
          }

        }

        // if we don't have one, we need to create one
        // if (vps === null){} else {
        // }

        // else, we need to create a compute instance and point the domains etc
      }
    }
  }

  return c.json({
    ok: true,
    message: "Hello Hono!",
  });
});
