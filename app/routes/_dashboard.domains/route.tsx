import Page from "./page";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { db } from "~/db/index.server";
import { TB_domain } from "~/db/schema.server";
// import { eq } from "drizzle-orm";
import { EVENTS } from "~/utils/live-data/emitter.server";
import { generateId } from "lucia";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";

export function loader({ request }: LoaderFunctionArgs) {
  return validateSessionAndRedirectIfInvalid(request)
    .then(async (session) => ({
      session,
      data: await prisma.user.findFirst({
        where: {
          firebase_id: session.uid,
        },
        select: {
          domains: true,
        },
      }),
    }))
    .then((data) => ({
      domains: data.data!.domains,
    }));
}

export { Page as default };

export async function action({ request }: ActionFunctionArgs) {
  const data = await validateSessionAndRedirectIfInvalid(request);
  await db.insert(TB_domain).values({
    name: generateId(10),
    ownerUser: data.uid,
  });
  EVENTS.DOMAIN_PURCHASED({ userId: "11" });
  return null;
}
