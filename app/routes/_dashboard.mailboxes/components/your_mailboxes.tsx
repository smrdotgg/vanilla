import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "~/components/ui/button";
import { MdDelete } from "react-icons/md";
import { Badge } from "~/components/ui/badge";
import { MailBoxStatus } from "@prisma/client";
// import { DeleteDomainDialog } from "./delete_domain_dialog";

type RowData = {
  domainId: string;
  address: string;
  fullName: string;
  status: MailBoxStatus;
};

export function YourMailboxes({ rows }: { rows: RowData[] }) {
  return (
    <Table>
      <TableCaption>A list of your mailboxes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Email address</TableHead>
          <TableHead>Full Name</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{row.address}</TableCell>
            <TableCell>{row.fullName}</TableCell>
            <TableCell className="text-right">
              <RowBadge status={row.status} />
              {/* <Badge variant="outline">Badge</Badge> */}
            </TableCell>
            {/* <TableCell className="text-right"> */}
            {/*   <DeleteDomainDialog domainId={String(row.domainId)}> */}
            {/*     <Button variant={"ghost"} className="py-0"> */}
            {/*       <MdDelete className="text-red-500" /> */}
            {/*     </Button> */}
            {/*   </DeleteDomainDialog> */}
            {/* </TableCell> */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RowBadge({ status }: { status: MailBoxStatus }) {
  if (status === "PENDING") {
    return (
      <Badge
        variant="secondary"
        className=" rounded-full border border-yellow-600 bg-yellow-50 text-yellow-600"
      >
        Pending...
      </Badge>
    );
  } else if (status === "ADDED") {
    return (
      <Badge
        variant="secondary"
        className="rounded-full border border-green-700 bg-green-100 text-green-700"
      >
        Added
      </Badge>
    );
  }

  return <Badge
    variant="secondary"
    className="rounded-full border border-gray-700 bg-gray-100 text-gray-700"
  >
    Unknown State
  </Badge>;
}

// INIT
// VPS_SET_UP
// ADDED
// DELETED
// ERROR
