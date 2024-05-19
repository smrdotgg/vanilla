import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";
import { api } from "~/server/trpc/server.server";
import { generateId } from "lucia";
import { getCookieSessionOrThrow } from "~/server/auth.server";
import { formSchema } from "./types";
import { db } from "~/db/index.server";
import { TB_splitboxes } from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { zx } from "zodix";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const previouslyCreatedSplitboxes = getCookieSessionOrThrow(request)
    .then((r) =>
      db
        .select()
        .from(TB_splitboxes)
        .where(eq(TB_splitboxes.userId, r.user.id)),
    )
    .then((r) => r.length);
  return { previouslyCreatedSplitboxes: await previouslyCreatedSplitboxes };
};

export { Page as default };

export const action = async ({ request }: ActionFunctionArgs) => {
  const id = generateId(20);
  const { name } = await zx.parseForm(request, formSchema);
  api(request).compute.createSplitbox.mutate({ id, name: name });

  return {};
};
