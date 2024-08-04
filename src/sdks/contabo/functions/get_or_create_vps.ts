import { prisma } from "~/utils/db";
import { Instance, Links } from "../types";
import { env } from "~/utils/env";
import { getAccessToken } from "../helpers/get_access_token";
import { consoleLog } from "~/utils/console_log";

export async function getOrCreateVPSAndGetId({
  mailboxId,
}: {
  mailboxId: number;
}) {
  const mailbox = (await prisma.mailbox.findFirst({
    where: { id: mailboxId },
  }))!;
  const existingVPS =
    (await prisma.vps.findFirst({
      where: { domain: mailbox.domainName },
    })) ??
    (await prisma.vps.findFirst({
      where: { OR: [{ domain: { equals: null } }, { domain: { equals: "" } }] },
    }));

  let vpsContaboId: string;
  if (existingVPS) {
    // !== null) {
    consoleLog(`Found existing VPS`);
    await prisma.vps.update({
      data: {
        domain: mailbox.domainName,
      },
      where: {
        id: existingVPS.id,
      },
    });
    vpsContaboId = existingVPS.compute_id_on_hosting_platform;
  } else {
    consoleLog(`Creating VPS`);
    vpsContaboId = await createVPSInstance().then((d) => d.id);
    await prisma.vps.create({
      data: {
        domain: mailbox.domainName,
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

  consoleLog(`Creating VPS instance with UUID: ${uuid}`);

  const headers = new Headers();
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  consoleLog(
    `Sending request to create VPS instance with headers: ${JSON.stringify(
      headers
    )}`
  );

  const response = await fetch("https://api.contabo.com/v1/compute/instances", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      period: 1,
      rootPassword: env.CONTABO_VPS_LOGIN_PASSWORD_ID,
    }),
  });
  const responseJson = await response.json();
  consoleLog(`data: ${JSON.stringify(responseJson)}`);
  return {
    id: `${responseJson["_links"]["self"]}`.split("/v1/compute/instances/")[1],
    data: responseJson,
  };
}

export async function getVPSInstanceData({ id }: { id: string }): Promise<{
  data: Instance[];
  _links: Links;
}> {
  consoleLog("getVPSInstanceData", id);
  const uuid = crypto.randomUUID();
  const token = await getAccessToken();

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);

  const response = await fetch(
    `https://api.contabo.com/v1/compute/instances/${id}`,
    {
      method: "GET",
      headers: headers,
    }
  );
  const responseJson = await response.json();
  consoleLog("resonse json", JSON.stringify(responseJson, null, 2));
  return responseJson;
}
