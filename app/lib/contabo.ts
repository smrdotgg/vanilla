import { env } from "~/api";

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

async function getAccessToken() {
  const fd = new URLSearchParams();
  fd.append("client_id", env.CONTABO_CLIENT_ID);
  fd.append("client_secret", env.CONTABO_CLIENT_SECRET);
  fd.append("username", env.CONTABO_USERNAME);
  fd.append("password", env.CONTABO_PASSWORD);
  fd.append("grant_type", "password");

  return fetch(
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
    .then((js) => `${js["access_token"]}`);
}

async function getVPSInstanceData({ id }: { id: string }) {
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

main();
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
