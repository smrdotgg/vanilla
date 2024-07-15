/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { action } from "../../route";
import { useEffect, useState } from "react";
import { DNSTransferDialog_InitialPage } from "./pages/initial";
import { DNSTransferDialog_FormPage } from "./pages/form";

export function DNSTransferDialog() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<"initial" | "transferForm">("transferForm");

  const fetcher = useFetcher<typeof action>();
  useEffect(() => {
    if (fetcher.data?.ok) {
      setOpen(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (open) setPage("transferForm");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={"secondary"}>
          (DNS) Transfer In Domain
        </Button>
      </DialogTrigger>
      <DialogContent className='p-10 max-h-screen overflow-y-auto' >
        {page === "initial" && (
          <DNSTransferDialog_InitialPage
            onClick={() => setPage("transferForm")}
          />
        )}
        {page === "transferForm" && (
          <DNSTransferDialog_FormPage setOpen={setOpen} open={open}/>
        )}
      </DialogContent>
    </Dialog>
  );
}
