/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

export function DNSTransferDialog_InitialPage({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>(DNS) Transfer In Domain</DialogTitle>
        <DialogDescription>
          Enter all the domains you want to transfer in:
        </DialogDescription>
      </DialogHeader>
      <DNSTransferCopy />
      <NextButton onClick={onClick} />
    </>
  );
}

// TODO: format copy
function DNSTransferCopy() {
  return (
    <>
      Domain Transfer Instructions To transfer your domains, please update the
      nameservers for each domain to the following: dns1.name-services.com
      dns2.name-services.com dns3.name-services.com dns4.name-services.com
      dns5.name-services.com Cost: The transfer fee is $5 per domain per year.
      Timing: Transfers are typically instant, but may occasionally take a few
      hours. Important Notes: Custom DNS Records: Transferring your domains will
      erase any custom DNS records you currently have set. Please inform us of
      any specific records you need to retain, and we will configure them
      accordingly. Email Service: Any existing mailboxes tied to your domains
      will cease to function after the transfer. Only mailboxes registered with
      our service will be operational on the transferred domains. Please ensure
      that you have updated the nameservers for all domains you wish to
      transfer. If you require assistance or have any questions, feel free to
      contact us.
    </>
  );
}

function NextButton({ onClick }: { onClick: () => void }) {
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox
          value={active}
          onChange={() => setActive(Number(!active))}
          onCheckedChange={() => setActive(Number(!active))}
          id="terms"
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have set nameservers for each of my domains I want to transfer.
        </label>
      </div>
      <Button
        onClick={onClick}
        variant={active ? "default" : "secondary"}
        disabled={!active}
      >
        Next
      </Button>
    </>
  );
}
