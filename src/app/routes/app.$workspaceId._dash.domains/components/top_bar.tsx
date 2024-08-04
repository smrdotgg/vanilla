import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { DNSTransferDialog } from "./dns_transfer_dialog";

export function TopBar() {
  return (
    <div className="flex justify-between  *:my-auto">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Domains</h1>
        <p className="text-gray-500">
          Manage your domains and purchase new ones.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <DNSTransferDialog />
        {/* <TransferDomainDialog /> */}
        {/* <Button asChild variant={"default"}> */}
        {/*   <Link to="search">Purchase new Domain</Link> */}
        {/* </Button> */}
      </div>
    </div>
  );
}
