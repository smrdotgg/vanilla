import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { MailBoxStatus } from "@prisma/client";

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
          <TableHead className="w-[200px]">Full Name</TableHead>
          <TableHead className="w-[200px]">Email address</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.fullName}</TableCell>
            <TableCell>{row.address}</TableCell>
            <TableCell className="text-right">
              <RowBadge status={row.status} />
            </TableCell>
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
        className=" rounded-full border border-yellow-600 bg-yellow-50 text-yellow-600 dark:border-yellow-300 dark:bg-yellow-800 dark:text-yellow-100"
      >
        Pending...
      </Badge>
    );
  }

  if (status === "ADDED") {
    return (
      <Badge
        variant="secondary"
        className="rounded-full border border-green-700 bg-green-100 text-green-700 dark:border-green-300 dark:bg-green-800 dark:text-green-100"
      >
        Added
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="rounded-full border border-gray-700 bg-gray-100 text-gray-700"
    >
      Unknown State
    </Badge>
  );
}
