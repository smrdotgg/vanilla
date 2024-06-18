import { env } from "~/api";
import { prisma } from "~/db/prisma";
import { Instance, Links } from "./contabo_types";

export interface ComputeManagerInterface {
  createVPSInstance: () => Promise<{ id: string; data: unknown }>;
  getVPSInstanceData: (params: { id: string }) => Promise<{
    data: Instance[];
    _links: Links;
  }>;
}

const ContaboComputeManager: ComputeManagerInterface = {
  createVPSInstance,
  getVPSInstanceData,
};

export const ComputeManager: ComputeManagerInterface = ContaboComputeManager;

async function createVPSInstance() {
  const uuid = crypto.randomUUID();
  const token = await getAccessToken();

  console.log(`Creating VPS instance with UUID: ${uuid}`);

  const headers = new Headers();
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  console.log(
    `Sending request to create VPS instance with headers: ${JSON.stringify(headers)}`,
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
type ContaboAccessTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  token_type: string;
  "not-before-policy": string;
  session_state: string;
  scope: string;
};

export async function getAccessToken() {
  const t = await prisma.contabo_token.findMany();
  if (t.length > 0) {
    const expiresAt = t[0].expires_at;
    const now = new Date(Date.now());
    const isExpired = expiresAt < now;
    if (!isExpired) {
      console.log("[CONTABO ACCESS TOKEN] cache hit");
      return t[0].token;
    } else {
      await prisma.contabo_token.delete({ where: { id: t[0].id } });
    }
  }

  const fd = new URLSearchParams();
  fd.append("client_id", env.CONTABO_CLIENT_ID);
  fd.append("client_secret", env.CONTABO_CLIENT_SECRET);
  fd.append("username", env.CONTABO_API_USERNAME);
  fd.append("password", env.CONTABO_API_PASSWORD);
  fd.append("grant_type", "password");

  const response = await fetch(
    "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: fd,
    },
  )
    .then((r) => r.json())
    .then((js) => {
      js = js as ContaboAccessTokenResponse;
      if (js.access_token.length)
        console.log("[CONTABO ACCESS TOKEN] cache miss ");
      return js;
    });
  return response.access_token;
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

export async function cancelInstance({ id }: { id: string }) {
  console.log("getVPSInstanceData", id);
  const uuid = crypto.randomUUID();
  const token = await getAccessToken();

  const headers = new Headers();
  // headers.append("Content-Type", "application/json");
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);

  return fetch(`https://api.contabo.com/v1/compute/instances/${id}/cancel`, {
    method: "POST",
    headers: headers,
  }).then((r) => r.json());
}

export async function reinstateIntance({ id }: { id: string }) {
  console.log("getVPSInstanceData", id);
  const uuid = crypto.randomUUID();
  const token = await getAccessToken();

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);

  return fetch(`https://api.contabo.com/v1/compute/instances/${id}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({ imageId: "db1409d2-ed92-4f2f-978e-7b2fa4a1ec90" }),
  }).then((r) => r.json());
}

async function getAllVPSInstanceData() {
  const uuid = crypto.randomUUID();
  const token = await getAccessToken();

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);

  return fetch(`https://api.contabo.com/v1/compute/instances`, {
    method: "GET",
    headers: headers,
  }).then((r) => r.json());
}

async function main() {
  console.log("main");
  console.log(
    JSON.stringify(
      (await getAllVPSInstanceData())["data"].map(
        (el: never) =>
          `IP: ${el["ipConfig"]["v4"]["ip"]} , instance ID: ${el["instanceId"]}`,
      ),
      null,
      2,
    ),
  );
  return;
}
// main();
