/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RiQuestionLine } from "react-icons/ri";

import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { INTENTS } from "../types";
import { Input } from "~/components/ui/input";

import { action, loader } from "../route";
import { ReactNode, useEffect, useState } from "react";

export function ResubmitTransferDomainDialog({
  transferId,
  children,
}: {
  transferId: number;
  children: ReactNode;
}) {
  const { dnsPendingTransfers } = useLoaderData<typeof loader>();
  const pendingTransfer = dnsPendingTransfers
    .filter((pt) => pt.id === transferId)
    .at(0)!;

  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<typeof action>();
  useEffect(() => {
    if (fetcher.data?.ok) {
      setOpen(false);
    }
  }, [fetcher]);

  const loading = fetcher.state !== "idle";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resubmit Transfer</DialogTitle>
          <DialogDescription>
            Resubmit domain transfer info to try again
          </DialogDescription>
        </DialogHeader>

        <fetcher.Form
          aria-disabled={loading}
          method="post"
          className="flex flex-col gap-4"
        >
          <input hidden={true} name="intent" value={INTENTS.resubmitTransfer} />
          <input hidden={true} name="transferId" value={transferId} />
          <input hidden={true} name="domain" value={pendingTransfer.name} />
          <Input name="domain" value={pendingTransfer.name} disabled required />
          <div className="flex w-full">
            <Input
              name="code"
              placeholder="Authorization Code"
              autoComplete="off"
              className="w-full"
              required
              defaultValue={undefined}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex *:m-auto bg-secondary size-9">
                  <RiQuestionLine />
                </TooltipTrigger>
                <TooltipContent className="max-w-72">
                  <p>
                    A domain authorization code (also referred to as an Auth
                    Code or EPP Code) provides an extra level of security for
                    domain name registration. This code is unique to each domain
                    name and is assigned by the registrar at the time of
                    registration.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <DialogFooter className="flex   sm:justify-between">
            <p className=" text-start text-red-400 my-auto">
              {(fetcher.data as any)?.message ?? <>&nbsp;</>}
            </p>
            <div className="flex">
              <DialogClose asChild>
                <Button disabled={loading} type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <div className="pl-2"></div>
              <Button disabled={loading} type="submit">
                {loading ? "Submitting..." : "Re-submit"}
              </Button>
            </div>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
