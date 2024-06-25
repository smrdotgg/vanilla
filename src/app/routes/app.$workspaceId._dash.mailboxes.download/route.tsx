import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";

export const loader: LoaderFunction = async (params: LoaderFunctionArgs) => {
  const session = await workspaceGuard(params);

  const mailboxes = await prisma.mailbox.findMany({
    where: { workspaceId: Number(session.workspaceMembership.workspace_id), status: "ADDED" },
    include: { domain: true },
  })

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

