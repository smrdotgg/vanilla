import { CopyIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function BreakDeleteModal({
  open,
  setOpen,
  onDelete,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Break?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this break?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-1 sm:justify-end">
          <Button onClick={() => setOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            variant="destructive"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
