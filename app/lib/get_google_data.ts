export async function getGoogleidWithAccesstoken({
  accessToken,
}: {
  accessToken: string;
}) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
  );
  if (!response.ok) throw Error("Error getting Google ID with acesss token");
  const data = (await response.json()) as {
    id: string;
    picture: string;
    email: string;
    email_verified: boolean;
  };
  return data;
}
