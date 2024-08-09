import { MailboxTable } from "./components/mailbox_table";
import { columns } from "./components/columns";
import { prisma } from "~/utils/db";
import { useLoaderData, useRevalidator, useRouteError } from "@remix-run/react";
import { DnsimpleService } from "~/sdks/dnsimple";
import { DefaultErrorBoundary } from "~/components/custom/my-error-boundary";

const fullDomain = (subdomain: string, parent: string) =>
  `${subdomain.length ? subdomain + "." : ""}${parent}`;
export const loader = async () => {
  const mailboxes = (await prisma.mailbox_config.findMany({include: {domain: true}})).map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    username: m.username,
    subdomain: m.domainPrefix,
    parentDomain: m.domain.name,
    fullDomain: fullDomain(m.domainPrefix, m.domain.name),
    email: `${m.username}@${fullDomain(m.domainPrefix, m.domain.name)}`,
    smtp: {
      server: fullDomain(m.domainPrefix, m.domain.name),
      port: m.smtpPort,
      security: "SSL/TLS",
    },
    imap: {
      server: fullDomain(m.domainPrefix, m.domain.name),
      port: m.imapPort,
      security: "SSL/TLS",
    },
  }));

  const checkedDomains: string[] = [];
  const ipList: { [key: string]: string } = {};
  for (const mailbox of mailboxes) {
    if (checkedDomains.includes(mailbox.parentDomain)) continue;
    checkedDomains.push(mailbox.parentDomain);
    const ip = await DnsimpleService.getDomainRecords({
      domain: mailbox.parentDomain,
    }).then((iplist) => iplist.filter((i) => i.type.toUpperCase() === "A"));
    ip.forEach(
      (entry) =>
        (ipList[fullDomain(entry.host, mailbox.parentDomain)] = entry.record)
    );
  }

  const maiboxesWithIps = mailboxes.map((m) => {
    return {
      ...m,
      hardware: { ip: ipList[`mail.${m.fullDomain}`] },
    };
  });

  return { mailboxes: maiboxesWithIps };
};

export default function Page() {
  const { mailboxes } = useLoaderData<typeof loader>();
  return (
    <>
      <MailboxTable columns={columns} data={mailboxes} />
    </>
  );
}

export { DefaultErrorBoundary as ErrorBoundary };

// FirstName,LastName,Username,Domain,Email,SMTP Server,SMTP Port,SMTP Securityjkj,IMAP Server,IMAP Port,IMAP Security,Password
