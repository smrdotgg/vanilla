import { Link, useLoaderData } from "@remix-run/react";
import { IoMail } from "react-icons/io5";
import { TbWorld } from "react-icons/tb";
import { TopBar } from "./components/top_bar";
import { loader } from "./route";
import { Summary } from "../_dashboard.domains/components/summary";
import { YourMailboxes } from "./components/your_mailboxes";
import { Button } from "~/components/ui/button";

export default function Page() {
  const { domains, mailboxes } = useLoaderData<typeof loader>();

  // const mailboxes = domains.map((d) => d.mailbox).flat();

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
            addHref: "/domains",
          },
          {
            label: mailboxes.length === 1 ? "Mailbox" : "Mailboxes",
            icon: IoMail,
            digit: mailboxes.length,
            addHref: "/mailboxes",
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
            fullName: m.firstName + " " + m.lastName,
            address: m.username + "@" + m.domain.name,
            domainId: String(m.id),
            status: m.status,
          }))}
        />
      </div>
    </div>
  );
}
