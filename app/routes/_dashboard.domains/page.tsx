import { Link, useLoaderData } from "@remix-run/react";
import { IoMail } from "react-icons/io5";
import { TbWorld } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { loader } from "./route";
import { Summary } from "./components/summary";
import { YourDomains } from "./components/your_domains";
import { TopBar } from "./components/top_bar";

export default function Page() {
  const { data: domains, computeInstances } = useLoaderData<typeof loader>();

  const mailboxes = domains.map((d) => d.mailbox).flat();

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
        <p className="my-4 text-xl font-bold">Your Domains</p>
        <YourDomains
          rows={domains.map((d) => ({
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
