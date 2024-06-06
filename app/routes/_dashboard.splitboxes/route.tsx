import { Page } from "./page";
import { eq } from "drizzle-orm";
// import { db } from "~/db/index.server";
import { TB_splitboxes } from "~/db/schema.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { ComputeManager } from "~/lib/contabo";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data = await validateSessionAndRedirectIfInvalid(request);
  const splitboxes = await prisma.splitbox.findMany({
    where: { user: { firebase_id: data.uid } },
  });

  return { splitboxes };
};

export { Page as default };
