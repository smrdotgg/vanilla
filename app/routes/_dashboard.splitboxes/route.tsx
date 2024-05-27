import { Page } from "./page";
import { eq } from "drizzle-orm";
import { db } from "~/db/index.server";
import { TB_splitboxes } from "~/db/schema.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { ComputeManager } from "~/lib/contabo";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data = await validateSessionAndRedirectIfInvalid(request).then(({ uid }) =>
    db.select().from(TB_splitboxes).where(eq(TB_splitboxes.userId, uid)),
  );

  return { splitboxes: data };
};

export { Page as default };
