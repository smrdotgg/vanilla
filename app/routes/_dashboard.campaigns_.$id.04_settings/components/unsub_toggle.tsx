import { AnalyticToggle } from "../page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdOutlineUnsubscribe } from "react-icons/md";
import { useState } from "react";

export function UnsubToggle({
  optOutRate,
  setOptOutRate,
  optOutLink,
  setOptOutLink,
}: {
  optOutRate: boolean;
  setOptOutRate: (val: boolean) => void;
  optOutLink: string | null;
  setOptOutLink: (val: string | null) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <AnalyticToggle
        onSwitch={() => {
          if (optOutRate) setOptOutRate(false);
          else setDialogOpen(true);
        }}
        value={optOutRate}
        subtext="Track how many recipients unsubscribed from your emails."
        text="Unsubscribe Rate"
        icon={MdOutlineUnsubscribe}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add your opt-out link (optional)</DialogTitle>
            <DialogDescription>
              Add the opt out link users can use to unsubscribe from your email
              campaign.
              <br /> If you don&amos;t have one, we will automatically create one for
              you and handle the unsubscription. <br /> If you have one, but
              haven&amos;t added it to your email, we will automatically include it
              at the bottom of your emails for you. If you&amos;ve already included
              your link, we will leave your emails as is and simply track how
              many users unsubscribe.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unsub_link" className="text-right">
                Link
              </Label>
              <Input
                id="unsub_link"
                placeholder="https://example.com/unsubscribe"
                onChange={(e) => setOptOutLink(e.target.value)}
                value={optOutLink ?? undefined}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant={"secondary"}
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOptOutRate(true);
                setDialogOpen(false);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
