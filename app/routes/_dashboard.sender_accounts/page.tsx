import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { loader } from "./route";
import { BulkButton } from "./components/bulk_modal/index";
import { api } from "~/server/trpc/react";
import { useState } from "react";

export function Page() {
  const data = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const x = api.senderAccounts.createBulk.useMutation({
    onSuccess: () =>
      revalidator.state === "idle" ? revalidator.revalidate() : null,
  });
  const [search, setSearch] = useState("");

  return (
    <>
      <div className="flex h-screen max-h-screen flex-col  py-6">
        <div className="flex justify-between px-6 *:my-auto">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Sender Accounts</h1>
            <p className="text-gray-500">
              Manage the accounts you use to send your emails.
            </p>
          </div>
          <BulkButton
            onSubmit={(d) => {
              x.mutate(d);
            }}
          />
        </div>
        <div className="pt-2"></div>
        <Input
          className="ml-6 w-96"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="pt-6"></div>
        {data.googleUserInfos.map((d, i) => (
          <EmailCell key={i} {...d} />
        ))}
        <div className="flex flex-col gap-2">
          {data.senderAccounts
            .filter(
              (v) =>
                v.fromName.toLowerCase().includes(search.toLowerCase()) ||
                v.fromEmail.toLowerCase().includes(search.toLowerCase()),
            )
            .map((senderAcc, i) => (
              <div
                key={i}
                className=" flex cursor-pointer justify-between p-2 px-6 *:my-auto hover:bg-secondary"
              >
                <div className="">
                  <p className="font-bold">{senderAcc.fromName}</p>
                  <p>{senderAcc.fromEmail}</p>
                </div>
                <div>
                  <Button variant="outline">Manage</Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

function EmailCell(props: { name: string; email: string; profilePic: string }) {
  return (
    <div className="flex flex-col gap-3 px-6">
      <div className="flex  h-16 cursor-default gap-2 p-1 *:my-auto hover:bg-secondary">
        <img src={props.profilePic!} alt="profile pic" className="h-full" />
        <div className="flex flex-col">
          <p className="text-xl font-semibold ">{props.name}</p>
          <p>{props.email}</p>
        </div>
      </div>
      <div className="h-[.5px]  w-full bg-gray-100 dark:bg-gray-800"></div>
    </div>
  );
}

