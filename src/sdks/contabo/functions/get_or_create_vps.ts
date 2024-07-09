import { prisma } from "~/utils/db";
import { Instance, Links } from "../types";
import { env } from "~/utils/env";
import { getAccessToken } from "../helpers/get_access_token";

export async function getOrCreateVPSAndGetId({
  mailboxId,
}: {
  mailboxId: number;
}) {
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
    vpsContaboId = await createVPSInstance().then((d) => d.id);
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

async function createVPSInstance() {
  const uuid = crypto.randomUUID();
  const token = await getAccessToken();

  console.log(`Creating VPS instance with UUID: ${uuid}`);

  const headers = new Headers();
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  console.log(
    `Sending request to create VPS instance with headers: ${JSON.stringify(
      headers
    )}`
  );

  return fetch("https://api.contabo.com/v1/compute/instances", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      period: 1,
      rootPassword: env.CONTABO_VPS_LOGIN_PASSWORD_ID,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      console.log(`data: ${JSON.stringify(data)}`);
      console.log(`VPS instance created with ID: ${data["_links"]["self"]}`);
      return {
        id: `${data["_links"]["self"]}`.split("/v1/compute/instances/")[1],
        data,
      };
    });
}

export async function getVPSInstanceData({ id }: { id: string }): Promise<{
  data: Instance[];
  _links: Links;
}> {
  console.log("getVPSInstanceData", id);
  const uuid = crypto.randomUUID();
  const token = await getAccessToken();

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);

  return fetch(`https://api.contabo.com/v1/compute/instances/${id}`, {
    method: "GET",
    headers: headers,
  }).then((r) => r.json());
}

