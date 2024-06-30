import { useFetchers, useLoaderData } from "@remix-run/react";
import { IoMail } from "react-icons/io5";
import { TbWorld } from "react-icons/tb";
import { loader } from "./route";
import { Summary } from "./components/summary";
import { YourDomains } from "./components/your_domains";
import { TopBar } from "./components/top_bar";
import { PendingTransfers } from "./components/transfers";
import { INTENTS } from "./types";

export default function Page() {
  const { domains, workspaceMembership } = useLoaderData<typeof loader>();

  const fetchers = useFetchers();

  const domainsBeingDeleted = fetchers.filter(
    (fetcher) => fetcher.formData?.get("intent") === INTENTS.deleteDomain
  );

  const filteredDomains = domains.filter(
    (domain) =>
      !domainsBeingDeleted.find(
        (dbd) => dbd.formData?.get("domainId") === String(domain.id)
      )
  );

  const mailboxes = filteredDomains.map((d) => d.mailbox).flat(); //.flat();

  return (
    <div className="flex w-full flex-col p-6 ">
      <TopBar />
      <div className="pt-6"></div>
      <hr />
      <div className="pt-6"></div>
      <Summary
        data={[
          {
            label: filteredDomains.length === 1 ? "Domain" : "Domains",
            icon: TbWorld,

            digit: filteredDomains.length,
            addHref: `/app/${workspaceMembership.workspace_id}/domains/search`,
          },
          {
            label: mailboxes.length === 1 ? "Mailbox" : "Mailboxes",
            icon: IoMail,
            digit: mailboxes.length,
            addHref: `/app/${workspaceMembership.workspace_id}/mailboxes/add`,
          },
        ]}
      />
      <div className="pt-6"></div>
      <PendingTransfers />
      <div className="">
        <p className="my-4 text-xl font-bold">Your Domains</p>
        <YourDomains
          rows={filteredDomains.map((d) => ({
            name: d.name,
            parsedExpiryDate: d.expiresAt,
            domainId: d.id.toString(),
            mailboxCount: d.mailbox.length,
          }))}
        />
      </div>
    </div>
  );
}
