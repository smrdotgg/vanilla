import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { validateWorkspaceAndRedirectIfInvalid } from "~/auth/workspace";
import { prisma } from "~/db/prisma";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const { userWorkspaceId } = await validateWorkspaceAndRedirectIfInvalid({
    request,
  });

  const mailboxes = await prisma.mailbox.findMany({
    where: { workspaceId: Number(userWorkspaceId), status: "ADDED" },
    include: { domain: true },
  });

  const csvTopLine = `FirstName,LastName,Username,Domain,Email,SMTP Server,SMTP Port,SMTP Security,IMAP Server,IMAP Port,IMAP Security,Password`;
  const csvBody = mailboxes
    .map(
      (m) =>
        `${m.firstName},${m.lastName},${m.username},${m.domain.name},${m.username}@${m.domain.name},mail.${m.domain.name},465,SSL/TLS,mail.${m.domain.name},993,SSL/TLS,${m.password}`,
    )
    .join("\n");
  const csvString = csvTopLine + "\n" + csvBody;

  return new Response(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="mailboxes.csv"',
    },
  });
};
