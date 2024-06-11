import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import Page from "./page";
import { validateWorkspaceAndRedirectIfInvalid } from "~/auth/workspace";
import { prisma } from "~/db/prisma";
import { INTENTS } from "./types";
import { TinyFormSchema } from "./components/new_mailbox_tiny_form";
import { z } from "zod";

export async function loader({ request }: LoaderFunctionArgs) {
  const { userWorkspaceId } = await validateWorkspaceAndRedirectIfInvalid({
    request,
  });
  const workspace = await prisma.workspace.findUnique({
    where: { id: Number(userWorkspaceId) },
    include: {
      domain: {
        where: { deletedAt: null },
        include: { mailbox: { include: { domain: true } }, vps: true },
      },
    },
  })!;

  const mailboxes = workspace!.domain.map((d) => d.mailbox).flat();
  const domains = workspace!.domain;
  return { mailboxes, domains };
}

export { Page as default };

export async function action({ request }: ActionFunctionArgs) {
  console.log('Action function called');

  const { userWorkspaceId } = await validateWorkspaceAndRedirectIfInvalid({
    request,
  });
  console.log(`Validated workspace ID: ${userWorkspaceId}`);

  const body = await request.json();
  console.log('Received request body:', body);

  const intent = String(body["intent"]);
  console.log(`Intent: ${intent}`);

  if (intent === INTENTS.createMailboxes) {
    console.log('Creating mailboxes...');

    const result = z.array(TinyFormSchema).safeParse(body["data"]);
    if (!result.success || result.data === undefined) {
      console.error('Error parsing data:', result.error);
      return { success: false, error: result.error };
    }

    const domainNames = result.data.map((d) => d.domain);
    console.log(`Domain names: ${domainNames.join(', ')}`);

    const domains = await prisma.domain.findMany({
      where: { name: { in: domainNames } },
    });
    console.log(`Found domains: ${domains.map((domain) => domain.name).join(', ')}`);

    await prisma.mailbox.createMany({
      data: result.data.map((d) => ({
        domainId: domains.find((domain) => domain.name === d.domain)!.id,
        lastName: d.lastName,
        password: crypto.randomUUID(),
        username: d.username,
        firstName: d.firstName,
      })),
    });
    console.log('Mailboxes created successfully!');

    return redirect("/mailboxes");

  }

  return null;
}
