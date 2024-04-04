import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

export function BreakManagePortal({
  open,
  setOpen,
  onSubmit,
  initialValue,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  onSubmit: (val: string) => void;
  initialValue?: number;
}) {
  const [val, setVal] = useState<number | undefined>(initialValue);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How much time should this break last</DialogTitle>
            <DialogDescription>
              <div className="flex">
                <div className=" ">
                  <ToggleGroup
                    type="single"
                    value={String(val)}
                    onValueChange={(e) => setVal(Number(e))}
                    className="flex w-28 flex-col  *:mr-auto *:flex *:w-full *:justify-start *:gap-1"
                  >
                    <ToggleGroupItem
                      value={String(1 * 24)}
                      aria-label="Toggle bold"
                      className=""
                    >
                      <p>1 Day</p>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value={String(3 * 24)}
                      aria-label="Toggle italic"
                    >
                      <p>3 Days</p>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value={String(7 * 24)}
                      aria-label="Toggle italic"
                    >
                      <p>1 Week</p>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value={String(14 * 24)}
                      aria-label="Toggle italic"
                    >
                      <p>2 Weeks</p>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value={String(30 * 24)}
                      aria-label="Toggle italic"
                    >
                      <p>1 Month</p>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={val === undefined}
              onClick={() => {
                onSubmit(String(val!));
                setOpen(false);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
