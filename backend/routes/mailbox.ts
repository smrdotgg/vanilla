import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "~/db/prisma";
import { ComputeManager } from "~/lib/contabo";
import {
  addUserToVPS,
  browserTest,
  enableIpv6,
  initializeEmailwiz,
  postEmailwizPointers,
  tieVPSAndDomain,
} from "./mailbox.helpers";
import { env } from "~/api";
import { setIpv4ReverseDNS } from "backend/utils/bot/ipv4";
import { setIpv6ReverseDNS } from "backend/utils/bot/ipv6";
import { setHosts } from "backend/utils/namecheap/setHosts";
import { mailbox, domain } from "@prisma/client";
import { sleep } from "~/lib/time";

export const mailboxRoute = new Hono();

mailboxRoute.get("/", async (c) => {
  await browserTest();
  return c.json({ hello: "WWW" });
});

// sets up mailboxes to get them ready for use
mailboxRoute.post("/setup", async (c) => {
  console.log("Request received for setupMailboxes");
  const requestJson = await c.req.json();
  console.log("Request JSON:", requestJson);
  const mailboxIds = requestJson["mailboxIds"];
  console.log("Mailbox IDs:", mailboxIds);
  const parsedMailboxIds = z.array(z.coerce.number()).parse(mailboxIds);
  console.log("Parsed Mailbox IDs:", parsedMailboxIds);
  await setupMailboxes({ mailboxIds: parsedMailboxIds });
  console.log("All mailboxes processed successfully.");
  return c.json({
    ok: true,
    message: "Hello Hono!",
  });
});

export async function setupMailboxes({ mailboxIds }: { mailboxIds: number[] }) {
  const mailboxes = await prisma.mailbox.findMany({
    where: { id: { in: mailboxIds } },
    include: { domain: { include: { vps: true } } },
  });
  console.log("Fetched mailboxes:", mailboxes);
  for (const mailbox of mailboxes) {
    console.log(`Processing mailbox with ID: ${mailbox.id}`);
    if (mailbox.status === "ADDED") {
      console.log(`Mailbox ID ${mailbox.id} already added, skipping...`);
      continue;
    }

    const vpsContaboId = await getOrCreateVPSAndGetId({
      mailboxId: mailbox.id,
    });
    console.log(`VPS Contabo ID for mailbox ID ${mailbox.id}:`, vpsContaboId);
    const contaboData = await ComputeManager.getVPSInstanceData({
      id: String(vpsContaboId),
    });
    console.log(`Contabo data for mailbox ID ${mailbox.id}:`, contaboData);

    const vpsDataFromDB = await prisma.vps.findFirst({
      where: { compute_id_on_hosting_platform: vpsContaboId },
    });
    console.log(
      `VPS data from DB for mailbox ID ${mailbox.id}:`,
      JSON.stringify(contaboData, null, 2),
    );

    if (vpsDataFromDB === null) throw Error("VPS data not found in database.");

    console.log("VPS ID fetched from database:", vpsDataFromDB.id);

    if (!vpsDataFromDB.ipv6Enabled) {
      console.log("IPv6 is not enabled. Enabling now...");
      await enableIpv6({
        host: contaboData.data[0].ipConfig.v4.ip,
        username: env.CONTABO_VPS_LOGIN_USERNAME,
        password: env.CONTABO_VPS_LOGIN_PASSWORD,
        port: 22,
      });

      console.log("IPv6 enabled, updating database...");
      await prisma.vps.update({
        where: { id: vpsDataFromDB.id },
        data: { ipv6Enabled: true },
      });
      console.log("Database updated: IPv6 enabled.");
    } else {
      console.log("IPv6 already enabled, skipping...");
    }

    if (!vpsDataFromDB.emailwizInitiated) {
      console.log("Emailwiz not initiated, starting setup...");
      await tieVPSAndDomain({ mailbox, contaboData });
      console.log("VPS and domain tied.");

      await sleep(10 * 60 * 1000);

      await initializeEmailwiz({ mailbox, contaboData });
      console.log("Emailwiz initialized.");

      await postEmailwizPointers({ mailbox, contaboData });
      console.log("Emailwiz DNS pointers updated.");

      await prisma.domain.update({
        where: { id: mailbox.domainId },
        data: { vps_id: vpsDataFromDB.id },
      });
      console.log("Domain updated with VPS ID.");

      await prisma.vps.update({
        where: { id: vpsDataFromDB.id },
        data: { emailwizInitiated: true },
      });
      console.log("VPS updated: Emailwiz initiated.");
    }

    if (mailbox.status === "PENDING") {
      console.log(`Setting up user ${mailbox.username} on VPS...`);
      await addUserToVPS({
        ip: contaboData.data[0].ipConfig.v4.ip,
        password: mailbox.password,
        username: mailbox.username,
      });
      console.log(`User ${mailbox.username} added to VPS.`);

      await prisma.mailbox.update({
        where: { id: mailbox.id },
        data: { status: "ADDED" },
      });
      console.log(
        `Mailbox status updated to ADDED for mailbox ID ${mailbox.id}.`,
      );
    } else {
      console.log(
        `Status for mailbox ID ${mailbox.id} is not pending, skipping user setup.`,
      );
    }
  }
}

function swapLast({ data, lastVal }: { data: string; lastVal: string }) {
  return data.slice(0, data.length - 1) + lastVal; //.map((d, i) =>;
}

// run emailwiz
async function runEmailWiz() {}

async function getOrCreateVPSAndGetId({ mailboxId }: { mailboxId: number }) {
  const mailboxWithVPS = await prisma.mailbox.findFirst({
    where: { id: mailboxId },
    include: { domain: { include: { vps: true } } },
  });
  const existingVPS =
    mailboxWithVPS?.domain.vps ??
    (await prisma.vps.findFirst({
      where: { domain: { none: {} } },
    }));
  let vpsContaboId: string;
  if (existingVPS !== null) {
    await prisma.vps.update({
      data: {
        domain: { connect: { id: mailboxWithVPS!.domain.id } },
      },
      where: {
        id: existingVPS.id,
      },
    });
    vpsContaboId = existingVPS.compute_id_on_hosting_platform;
  } else {
    vpsContaboId = await ComputeManager.createVPSInstance().then((d) => d.id);
    await prisma.vps.create({
      data: {
        domain: { connect: { id: mailboxWithVPS!.domain.id } },
        compute_id_on_hosting_platform: vpsContaboId,
        name: crypto.randomUUID(),
      },
    });
  }
  return vpsContaboId;
}
