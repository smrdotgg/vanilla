import { getAccessToken } from "../helpers/get_access_token";
import { Instance, Links } from "../types";

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

