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

import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { INTENTS } from "../types";
import { Input } from "~/components/ui/input";
import { action } from "../route";
import { useEffect, useState } from "react";

export function TransferDomainDialog() {
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
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={"secondary"}>
          Transfer In
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer In Domain</DialogTitle>
          <DialogDescription>
            Enter the domain you want to transfer in:
          </DialogDescription>
        </DialogHeader>

        <fetcher.Form
          aria-disabled={loading}
          method="post"
          className="flex flex-col gap-4"
        >
          <input hidden={true} name="intent" value={INTENTS.transferInDomain} />
          <Input
            name="domain"
            placeholder="my-external-domain.com"
            autoComplete="off"
            required
          />
          <div className="flex w-full">
            <Input
              name="code"
              placeholder="Authorization Code"
              autoComplete="off"
              className="w-full"
              required
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
              {/* <Button onClick={() => { */}
              {/*   const fd = new FormData(); */}
              {/*   fd.append("intent", INTENTS.transferInDomain); */}
              {/*   fd.append("code", "abc"); */}
              {/*   fd.append("domain", "splitbox.club"); */}
              {/*   fetcher.submit(fd, {method: "post"}); */}
              {/* }}> */}
              {/*   {loading ? "Submitting..." : "Submit"} */}
              {/* </Button> */}
              <Button disabled={loading} type="submit">
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
