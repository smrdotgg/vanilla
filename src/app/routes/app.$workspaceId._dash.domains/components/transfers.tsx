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
import { TransferDomainDNSListDialog } from "./transfer_domain_dialog";

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
            <TableHead>Nameservers</TableHead>
            <TableHead className="flex justify-end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dnsPendingTransfers.map((row, index) => {
            const coreComponent = (
              <TableRow key={!!row.dnsUrls ? null : index}>
                <TableCell className="font-medium w-80">{row.name}</TableCell>
                <TableCell className={row.note ? "" : "text-gray-500"}>
                  {row.success ? "YES" : "NO"}
                  {row.note ?? "No notes"}
                </TableCell>
                <TableCell>
                  {!!row.dnsUrls &&
                    truncateString({
                      str: row.dnsUrls.join(", "),
                      maxLength: 50,
                    })}
                  {!row.dnsUrls && "No Nameservers"}
                </TableCell>
                <TableCell>
                  <RowActions index={index} />
                </TableCell>
              </TableRow>
            );
            if (row.dnsUrls)
              return (
                <TransferDomainDNSListDialog
                  dnsList={row.dnsUrls}
                  key={index}
                  domainName={row.name}
                >
                  {coreComponent}
                </TransferDomainDNSListDialog>
              );
            return coreComponent;
          })}
        </TableBody>
      </Table>
    </div>
  );
}
function truncateString({
  str,
  maxLength,
}: {
  str: string;
  maxLength: number;
}): string {
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
}

function RowActions({ index }: { index: number }) {
  const { dnsPendingTransfers } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const { id } = dnsPendingTransfers[index];
  return (
    <div className="flex justify-end">
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
