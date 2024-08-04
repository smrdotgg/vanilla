import { prisma } from "~/utils/db";
import { env } from "~/utils/env";

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
    }
  )
    .then((r) => r.json())
    .then((js) => {
      js = js as {
        access_token: string;
        expires_in: number;
        refresh_token: string;
        refresh_expires_in: number;
        token_type: string;
        "not-before-policy": string;
        session_state: string;
        scope: string;
      };
      if (js.access_token.length)
        console.log("[CONTABO ACCESS TOKEN] cache miss ");
      return js;
    });
  return response.access_token;
}
