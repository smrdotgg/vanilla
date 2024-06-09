import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLoaderData } from "@remix-run/react";
import { loader } from "../route";
import { Button } from "~/components/ui/button";
import { MdDelete } from "react-icons/md";
import { DeleteDomainDialog } from "./delete_domain_dialog";

type RowData = {
  domainId: string;
  name: string;
  mailboxCount: number;
  parsedExpiryDate: string;
};

export function YourDomains({ rows }: { rows: RowData[] }) {
  return (
    <Table>
      <TableCaption>A list of your domains.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Domain</TableHead>
          <TableHead>Mailbox Count</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead className="text-right">Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.mailboxCount}</TableCell>
            <TableCell>{row.parsedExpiryDate}</TableCell>
            <TableCell className="text-right">
              <DeleteDomainDialog domainId={String(row.domainId)}>
                <Button variant={"ghost"} className="py-0">
                  <MdDelete className="text-red-500" />
                </Button>
              </DeleteDomainDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
