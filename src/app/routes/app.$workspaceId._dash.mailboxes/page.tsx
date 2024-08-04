import { TbWorld } from "react-icons/tb";
import { Summary } from "../app.$workspaceId._dash.domains/components/summary";
import { TopBar } from "./components/top_bar";
import { IoMail } from "react-icons/io5";
import { Button } from "~/components/ui/button";
import { Link, useLoaderData } from "@remix-run/react";
import { YourMailboxes } from "./components/your_mailboxes";
import { loader } from "./route";

export const Page = () => {
  const { workspaceId, domains, mailboxes } = useLoaderData<typeof loader>();

  return (
    <div className="flex w-full flex-col p-6 ">
      <TopBar />
      <div className="pt-6"></div>
      <hr />
      <div className="pt-6"></div>
      <Summary
        data={[
          {
            label: domains.length === 1 ? "Domain" : "Domains",
            icon: TbWorld,
            digit: domains.length,
            addHref: `/app/${workspaceId}/domains/search`,
          },
          {
            label: mailboxes.length === 1 ? "Mailbox" : "Mailboxes",
            icon: IoMail,
            digit: mailboxes.length,
            addHref: `/app/${workspaceId}/mailboxes/add`,
          },
        ]}
      />
      <div className="pt-6"></div>
      <div className="">
        <div className="flex w-full justify-between">
          <p className="my-4 text-xl font-bold">Your Mailboxes</p>
          <Button asChild variant="secondary">
            <Link target="_blank" to="download">
              Download
            </Link>
          </Button>
        </div>
        <YourMailboxes
          rows={mailboxes.map((m) => ({
            fullName: m.firstName + " " + (m.lastName ?? ""),
            address:
              m.username && m.domainName
                ? m.username + "@" + m.domainName
                : "N/A",
            domainId: String(m.id),
            status: m.status,
          }))}
        />
      </div>
    </div>
  );
};
