import { env } from "~/api";
import { db } from "~/db/index.server";
import { TB_contabo_token } from "~/db/schema.server";

export interface ComputeManagerInterface {
  createVPSInstance: () => Promise<{ id: string; data: unknown }>;
  getVPSInstanceData: (params: { id: string }) => Promise<unknown>;
}

const ContaboComputeManager: ComputeManagerInterface = {
  createVPSInstance,
  getVPSInstanceData,
};

export const ComputeManager: ComputeManagerInterface = ContaboComputeManager;

async function createVPSInstance() {
  const uuid = crypto.randomUUID();
  const token = await getAccessToken();

  const headers = new Headers();
  headers.append("x-request-id", uuid);
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  return fetch("https://api.contabo.com/v1/compute/instances", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      period: 1,
      rootPassword: env.CONTABO_LOGIN_PASSWORD_ID,
    }),
  })
    .then((r) => r.json())
    .then((data) => ({
      id: `${data["_links"]["self"]}`.split("/v1/compute/instances/")[1],
      data,
    }));
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

async function getAccessToken() {
  const t = await db.select().from(TB_contabo_token);
  if (t.length > 0) {
    const expiresAt = t[0].expiresAt;
    const now = new Date(Date.now());
    const isExpired = expiresAt < now;
    if (!isExpired) {
      return t[0].token;
    } else {
      await db.delete(TB_contabo_token);
    }
  }

  const fd = new URLSearchParams();
  fd.append("client_id", env.CONTABO_CLIENT_ID);
  fd.append("client_secret", env.CONTABO_CLIENT_SECRET);
  fd.append("username", env.CONTABO_USERNAME);
  fd.append("password", env.CONTABO_PASSWORD);
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
      console.log(JSON.stringify(js, null, 2));
      return js as ContaboAccessTokenResponse;
    });
    await db.insert(TB_contabo_token).values({
      token: response.access_token,
      expiresAt: new Date(Date.now() + (response.expires_in - 30) * 1000),
      refreshToken: response.refresh_token,
      refreshTokenExpiresAt: new Date(Date.now() + (response.refresh_expires_in - 30) * 1000),
    });
  return response.access_token;
}

async function getVPSInstanceData({ id }: { id: string }) {
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
