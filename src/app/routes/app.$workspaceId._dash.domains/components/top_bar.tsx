import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export function TopBar() {
  return (
    <div className="flex justify-between  *:my-auto">
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
  );
}
