export function generateRandomString(n: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  for (let i = 0; i < n; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}
