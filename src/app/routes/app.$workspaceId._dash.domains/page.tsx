import { useLoaderData } from "@remix-run/react";
import { IoMail } from "react-icons/io5";

import { TbWorld } from "react-icons/tb";
import { loader } from "./route";
import { Summary } from "./components/summary";
import { YourDomains } from "./components/your_domains";
import { TopBar } from "./components/top_bar";
import { PendingTransfers } from "./components/transfers";

export default function Page() {
  const { workingDnsDomains, mailboxes, workspaceMembership } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex w-full flex-col p-6 ">
      <TopBar />
      <div className="pt-6"></div>
      <hr />
      <div className="pt-6"></div>
      <Summary
        data={[
          {
            label: workingDnsDomains.length === 1 ? "Domain" : "Domains",
            icon: TbWorld,

            digit: workingDnsDomains.length,
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
        <YourDomains />
      </div>
    </div>
  );
}
