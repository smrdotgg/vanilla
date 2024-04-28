import { getCookieSession } from "~/server/auth.server";
import Page from "./page";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { db } from "~/db/index.server";
import { TB_domain } from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { EVENTS } from "~/utils/live-data/emitter.server";
import { generateId } from "lucia";

export function loader(args: LoaderFunctionArgs) {
  const data = getCookieSession(args.request).then(async (session) => {
    if (session === undefined) throw Error();
    const domains = await db
      .select()
      .from(TB_domain)
      .where(eq(TB_domain.ownerUser, session.userId));
    return { userId: session.userId, domains };
  });
  return defer({
     data,
  });
}

export { Page as default };

export async function action(args: ActionFunctionArgs) {
  const data = await getCookieSession(args.request);
  if (data === undefined) throw Error();

  await db
    .insert(TB_domain)
    .values({ ownerUser: data.userId, price: 10, name: generateId(10) });

  EVENTS.DOMAIN_PURCHASED({ userId: "11" });
  // emitter.emit(`domains`);

  return null;
}
