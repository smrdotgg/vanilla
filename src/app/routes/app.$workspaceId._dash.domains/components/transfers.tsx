import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loader } from "../route";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { LuTrash } from "react-icons/lu";
import { DeleteDialog } from "~/components/custom/delete-modal";
import { INTENTS } from "../types";

export function PendingTransfers() {
  const { dnsPendingTransfers } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const loading = revalidator.state === "loading";

  if (dnsPendingTransfers.length === 0) return <></>;

  return (
    <div className="">
      <div className="flex justify-between">
        <p className="my-4 text-xl font-bold">
          {dnsPendingTransfers.length} Pending Transfer
          {dnsPendingTransfers.length === 1 ? "" : "s"}
        </p>
        {loading && (
          <Button variant={"outline"} disabled>
            Refreshing...
          </Button>
        )}
        {!loading && (
          <Button variant={"outline"} onClick={revalidator.revalidate}>
            Refresh
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Domain</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="flex justify-end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dnsPendingTransfers.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium w-80">{row.name}</TableCell>
              <TableCell className={row.note ? "" : "text-gray-500"}>
                {row.success ? "YES":"NO"}
                {row.note ?? "No notes"}
              </TableCell>
              <TableCell>
                <RowActions index={index} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RowActions({ index }: { index: number }) {
  const { dnsPendingTransfers } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const { id } = dnsPendingTransfers[index];
  return (
    <div className="flex justify-end">
      {/* <ResubmitTransferDomainDialog transferId={dnsPendingTransfers[index].id}> */}
      {/*   <Button variant={"ghost"} className="text-sm" title="Resubmit"> */}
      {/*     <LuCornerDownLeft className="size-4" /> */}
      {/*   </Button> */}
      {/* </ResubmitTransferDomainDialog> */}
      <DeleteDialog
        action={() => {
          const fd = new FormData();
          fd.append("intent", INTENTS.deleteDomainViaDNS);
          fd.append("domainDnsTransferId", id.toString());
          fetcher.submit(fd, { method: "POST" });
        }}
        title="Cancel Domain Transfer?"
      >
        <Button variant={"ghost"} className="text-sm" title="Delete">
          <LuTrash className="size-4 text-red-500" />
        </Button>
      </DeleteDialog>
    </div>
  );
}
