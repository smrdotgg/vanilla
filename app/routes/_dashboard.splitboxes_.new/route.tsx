import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "./page";
import { api } from "~/server/trpc/server.server";
import { generateId } from "lucia";
import { formSchema } from "./types";
import { db } from "~/db/index.server";
import { TB_splitboxes } from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { zx } from "zodix";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const previouslyCreatedSplitboxes = validateSessionAndRedirectIfInvalid(request)
    .then((r) =>
      db
        .select()
        .from(TB_splitboxes)
        .where(eq(TB_splitboxes.userId, r.uid)),
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
