import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { INTENTS } from "./types";
import { Page } from "./page";
import { TinyFormSchema } from "./components/new_mailbox_form";
import { z } from "zod";

export async function loader(args: LoaderFunctionArgs) {
  const session = await workspaceGuard(args);

  const domains = await prisma.domain_dns_transfer.findMany({
    where: {
      workspaceId: session.workspaceMembership.workspace_id,
      canceledAt: null,
      success: true,
    },
  });

  return { domains };
}
export { Page as default };

export async function action(args: ActionFunctionArgs) {
  const session = await workspaceGuard(args);
  const body = await args.request.json();
  const intent = String(body["intent"]);
  if (intent === INTENTS.createMailboxes) {
    const result = z.array(TinyFormSchema).safeParse(body["data"]);
    if (!result.success || result.data === undefined) {
      console.error("Error parsing data:", result.error);
      return { ok: false, success: false, error: result.error };
    }

    await prisma.mailbox_config.createMany({
      data: result.data.map((d) => ({
        workspaceId: session.workspaceMembership.workspace_id,
        firstName: d.firstName,
        lastName: d.lastName,
        username: d.username,
        domainName: d.domain,
        password: crypto.randomUUID(),
      })),
    });

    return redirect(
      `/app/${session.workspaceMembership.workspace_id}/mailboxes`
    );
  }

  return null;
}
