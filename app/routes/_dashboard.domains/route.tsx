import { Form, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export default function Page() {
  const domains = [
    {
      name: "example.com",
      expirationDate: new Date(),
    },
    {
      name: "anotherlink.com",
      expirationDate: new Date(),
    },
  ];
  return (
    <>
      <div className="flex h-screen max-h-screen flex-col  pt-6">
        <div className="flex justify-between px-6 *:my-auto">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Domains</h1>
            <p className="text-gray-500">
              Manage your domains and purchase new ones.
            </p>
          </div>
          <Button asChild variant={"default"} >
            <Link to="/domains/new">Purchase new Domain</Link>
          </Button>
        </div>
        <div className="pt-2"></div>

        <div className="flex flex-grow flex-col  bg-primary-foreground px-6">
          <p className="my-4 text-xl">Your Domains</p>
          <div className="flex flex-col gap-2">
            {domains.map((domain, index) => (
              <div
                key={index}
                className="flex justify-between gap-1 rounded border bg-secondary px-4 py-5 align-top *:my-auto "
              >
                <div className="flex flex-col ">
                  <p className="text-md">{domain.name}</p>
                  <p className="text-md text-gray-600 dark:text-gray-400">
                    {formatDate(domain.expirationDate)}
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
    </>
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
