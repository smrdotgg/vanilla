import { lucia } from "~/auth/lucia.server";

export const getCookieSession = async (req: Request) => {
  const sessionId = lucia.readSessionCookie(req.headers.get("Cookie") ?? "");
  if (sessionId){
    const {session, user} = await lucia.validateSession(sessionId);
    if (session && user){
      return {...session, user};
    }
  }
}
