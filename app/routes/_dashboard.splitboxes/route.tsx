import { Page } from "./page";
import { eq } from "drizzle-orm";
import { db } from "~/db/index.server";
import { TB_splitboxes } from "~/db/schema.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getCookieSessionOrThrow } from "~/server/auth.server";
import { ComputeManager } from "~/lib/contabo";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // return await getCookieSessionOrThrow(request);
  const data = await getCookieSessionOrThrow(request)
    .then((authData) =>
      db
        .select()
        .from(TB_splitboxes)
        .where(eq(TB_splitboxes.userId, authData.user.id)),
    )
    .then((r) =>
      r.map((s) => ({
        ...s,
        vpsData: ComputeManager.getVPSInstanceData({
          id: s.computeIdOnHostingPlatform,
        }),
      })),
    );

  await Promise.all(data.map((d) => d.vpsData));

  return { splitboxes: data };
};

export { Page as default };
