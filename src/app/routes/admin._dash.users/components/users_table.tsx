import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loader } from "../route";
import { LucideCircleCheckBig } from "lucide-react";
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
import { useLoaderData, useFetcher } from "@remix-run/react";
import { ReactNode, useState } from "react";
import { Button } from "~/components/ui/button";
import { LuMoveUpLeft, LuTrash } from "react-icons/lu";
import { INTENTS } from "../types";
import { Checkbox } from "~/components/ui/checkbox";

export const UsersTable = () => {
  const { users } = useLoaderData<typeof loader>();
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);

  return (
    <div>
      <div className="flex justify-between  gap-2 *:my-auto ">
        <h1>
          {users.length} {users.length === 1 ? "User" : "Users"}
        </h1>
        <div className="flex justify-between gap-2 *:my-auto">
          <Checkbox
            checked={showDeletedUsers}
            onCheckedChange={() => setShowDeletedUsers(!showDeletedUsers)}
            className="my-2 text-muted-foreground "
          />
          <p className="text-muted-foreground">Show Deleted Users</p>
        </div>
      </div>
      <Table>
        <TableCaption>A list of your users.</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16">ID</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[100px]">Email Verified</TableHead>
            <TableHead>Workspace Count</TableHead>
            <TableHead>Auth Method</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>User Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((row, index) => (
            <TableRow
              hidden={row.deleted_at !== null && !showDeletedUsers}
              key={index}
              className={`hover:bg-transparent ${
                row.deleted_at === null
                  ? ""
                  : "text-muted-foreground line-through"
              }`}
            >
              <TableCell className="w-16">{row.id}</TableCell>
              <TableCell>{row.first_name ?? "N/A"}</TableCell>
              <TableCell>{row.last_name ?? "N/A"}</TableCell>
              <TableCell className={row.email ? "" : "text-gray-500"}>
                {row.email ?? "N/A"}
              </TableCell>
              <TableCell className="font-medium w-80">
                {row.email_verified ? <LucideCircleCheckBig /> : "N/A"}
              </TableCell>
              <TableCell>{row.workspace_user_join_list.length}</TableCell>
              <TableCell>{row.oauth_provider}</TableCell>
              <TableCell>{row.updated_at}</TableCell>
              <TableCell>{row.created_at}</TableCell>

              {/* Row is Deleted */}
              {row.deleted_at !== null && (
                <TableCell className="text-right">
                  <RestoreDomainDialog userId={String(row.id)}>
                    <Button variant={"ghost"} className="py-0">
                      <LuMoveUpLeft />
                    </Button>
                  </RestoreDomainDialog>
                </TableCell>
              )}

              {/* Row is not Deleted */}
              {row.deleted_at === null && (
                <TableCell className="text-right">
                  <DeleteDomainDialog userId={String(row.id)}>
                    <Button variant={"ghost"} className="py-0">
                      <LuTrash className="text-red-500" />
                    </Button>
                  </DeleteDomainDialog>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

function DeleteDomainDialog({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const fetcher = useFetcher();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you absolutely sure you want to delete this user?
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <fetcher.Form method="post">
              <input hidden name="intent" value={INTENTS.deleteUser} />
              <input hidden name="userId" value={userId} />
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </fetcher.Form>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RestoreDomainDialog({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const fetcher = useFetcher();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you absolutely sure you want to restore this user?
          </DialogTitle>
          <DialogDescription>
            This user currently cannot access their account.
            <br />
            This will enable them to access their account once again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <fetcher.Form method="post">
              <input hidden name="intent" value={INTENTS.restoreUser} />
              <input hidden name="userId" value={userId} />
              <Button type="submit">Restore</Button>
            </fetcher.Form>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
