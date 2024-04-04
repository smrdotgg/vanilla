import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { MdDelete } from "react-icons/md";

export function DeleteDialog({
  onDelete,
  size,
}: {
  onDelete: () => void;
  size: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex gap-2 font-semibold" variant={"destructive"}>
          <MdDelete /> Delete {size} Contact
          {size == 1 ? "" : "s"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Delete {size} Contact
            {size == 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {size} Contact
            {size == 1 ? "" : "s"}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"secondary"}>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant={"destructive"} onClick={onDelete}>
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
