import { Await, Form, Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { loader } from "./route";
import { Suspense } from "react";
import { useLiveLoader } from "~/utils/live-data/use-live-loader";
import { useUserId } from "../user_id";

export default function Page() {
  // const userId = useUserId();
  const { domains } = useLoaderData<typeof loader>();

  return (
    <div className="flex w-full flex-col  ">
      <div className="flex justify-between p-6 *:my-auto">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Domains</h1>
          <p className="text-gray-500">
            Manage your domains and purchase new ones.
          </p>
        </div>
        <Button asChild variant={"default"}>
          <Link to="search">Purchase new Domain</Link>
        </Button>
      </div>
      <hr />
      <div className="flex flex-grow flex-col px-6">
        <p className="my-4 text-xl">Your Domains</p>
        <div className="flex flex-col gap-2">
          {domains.map((domain, index) => (
            <div
              key={index}
              className="flex justify-between gap-1 border bg-secondary px-4 py-5 align-top *:my-auto "
            >
              <div className="flex flex-col ">
                <p className="text-md">{domain.name}</p>
                <p className="text-md text-gray-600 dark:text-gray-400">
                  {formatDate(new Date(domain.purchased_at))}
                </p>
              </div>
              <div className="flex flex-col ">
                <Button
                  variant={"secondary"}
                  className="border dark:border-gray-600"
                >
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const formatDate = (date: Date) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `Expires on ${day}${suffix} ${date.toLocaleString("default", { month: "short" })}, ${date.getFullYear()}`;
};
