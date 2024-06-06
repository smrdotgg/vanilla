import Page from "./page";
import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";
import { getUserWorkspaceIdFromCookie } from "~/cookies/workspace";

export async function loader({ request }: LoaderFunctionArgs) {
  const x = await getUserWorkspaceIdFromCookie({ request });
  console.log(`getUserWorkspaceIdFromCookie = ${x}`);
  return validateSessionAndRedirectIfInvalid(request)
    .then(async (session) => ({
      session,
      data: await prisma.domain.findMany({
        where: {
          workspace_id: Number(x),
        },
      }),
    }))
    .then((data) => ({
      domains: data.data,
    }));
}

export { Page as default };

export async function action({ request }: ActionFunctionArgs) {
  return null;
}
