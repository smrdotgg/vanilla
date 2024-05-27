import Page from "./page";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { db } from "~/db/index.server";
import { TB_domain } from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { EVENTS } from "~/utils/live-data/emitter.server";
import { generateId } from "lucia";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";

export function loader({ request }: LoaderFunctionArgs) {
  const data = validateSessionAndRedirectIfInvalid(request).then(async (session) => {
    const domains = await db
      .select()
      .from(TB_domain)
      .where(eq(TB_domain.ownerUser, session.uid));
    return { userId: session.uid, domains };
  });
  return defer({ data });
}

export { Page as default };

export async function action({ request }: ActionFunctionArgs) {
  const data = await validateSessionAndRedirectIfInvalid(request);
  await db
    .insert(TB_domain)
    .values({
      name: generateId(10),
      ownerUser: data.uid,
    });
  EVENTS.DOMAIN_PURCHASED({ userId: "11" });
  return null;
}
