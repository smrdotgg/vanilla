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
import { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import {  LuTrash } from "react-icons/lu";

export const UsersTable = () => {
  const { users } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>
        {users.length} {users.length === 1 ? "User" : "Users"}
      </h1>
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
            <TableRow key={index} className="hover:bg-transparent">
              <TableCell className="w-16">{row.id}</TableCell>
              <TableCell>{row.first_name ?? "N/A"}</TableCell>
              <TableCell>{row.last_name ?? "N/A"}</TableCell>
              <TableCell className={row.email ? "": "text-gray-500" }>
                {row.email ?? "N/A"}
              </TableCell>
              <TableCell className="font-medium w-80">
                {row.email_verified ? <LucideCircleCheckBig /> : "N/A"}
              </TableCell>
              <TableCell>{row.workspace_user_join_list.length}</TableCell>
              <TableCell>{row.oauth_provider}</TableCell>
              <TableCell>{row.updated_at}</TableCell>
              <TableCell>{row.created_at}</TableCell>
              <TableCell className="text-right">
                <DeleteDomainDialog domainId={String(row.id)}>
                  <Button variant={"ghost"} className="py-0">
                    <LuTrash className="text-red-500" />
                  </Button>
                </DeleteDomainDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

function DeleteDomainDialog({
  domainId,
  children,
}: {
  domainId: string;
  children: ReactNode;
}) {
  const { submit } = useFetcher();
  // return <>hi</>

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure you want to delete this user?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
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
                // fd.append("intent", INTENTS.deleteDomain);
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
