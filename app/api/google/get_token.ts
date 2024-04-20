import { env } from "~/api";

interface ErrorResponse {
  error: string;
  error_description: string;
}

export interface SuccessResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export async function exchangeCodeForTokens({
  code,
  redirectUri,
}: {
  redirectUri: string;
  code: string;
}) {
  const clientId = env.GOOGLE_CLIENT_ID!;
  const clientSecret = env.GOOGLE_CLIENT_SECRET!;
  const TOKEN_URI = "https://oauth2.googleapis.com/token";

  const response = await fetch(TOKEN_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();
  console.log("DATA");
  console.log(data);
  if ("error" in data) throw Error();
  return data as SuccessResponse;
}
