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
import { useFetcher } from "@remix-run/react";
import { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { INTENTS } from "../types";

export function DeleteDomainDialog({
  domainId,
  children,
}: {
  domainId: string;
  children: ReactNode;
}) {
  const { submit } = useFetcher();

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This will deactivate your domain.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => {
                const fd = new FormData();
                fd.append("intent", INTENTS.deleteDomain);
                fd.append("domainId", domainId);

                submit(fd, { method: "POST" });
              }}
              type="button"
              variant="destructive"
            >
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
