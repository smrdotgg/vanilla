import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

import { ReactNode } from "react";
import { LuCopy } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

export function TransferDomainDNSListDialog({
  children,
  domainName,
  dnsList,
}: {
  domainName: string;
  dnsList: string[];
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className=" flex  flex-col w-96">
        <DialogHeader>
          <DialogTitle>Transfer In Domain </DialogTitle>
          <DialogDescription>
            <span className="font-mono">{domainName}</span>
          </DialogDescription>
        </DialogHeader>

        <DNSTransferCopy dnsList={dnsList} domainName={domainName} />

        <DialogFooter className="flex sm:justify-end">
          <div className="flex">
            <DialogClose asChild>
              <Button type="button">OK</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// TODO: format copy
function DNSTransferCopy({
  domainName,
  dnsList,
}: {
  dnsList: string[];
  domainName: string;
}) {
  return (
    <div className="max-w-full  flex flex-col gap-4">
      <p>Set your DNS servers at your domain to the following:</p>
      <div className="bg-secondary p-4">
        <div className=" flex justify-between">
          <ul>
            {dnsList.map((dns) => (
              <li key={dns} className=" font-mono">
                {dns}
              </li>
            ))}
          </ul>
          <Button
            variant={"ghost"}
            onClick={async () => {
              const text = dnsList.join("\n");
              await navigator.clipboard.writeText(text);
              toast("Copied to clipboard");
            }}
          >
            <LuCopy />
          </Button>
        </div>
      </div>
      <p>
        Once you have set your DNS servers, you will be able to use{" "}
        <span className="bg-secondary font-mono ">{domainName}</span> in
        SplitBox.
      </p>
      <p>
        Please note that it might take up to 48 hours for the effect to take
        place and for you to gain access to{" "}
        <span className="font-mono bg-secondary px-1">{domainName}</span>.
      </p>
    </div>
  );
}
