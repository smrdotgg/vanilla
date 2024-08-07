import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
  TableCaption,
} from "@/components/ui/table";
import { useLoaderData } from "@remix-run/react";
import { loader } from "../route";
import { MyCheckMark, MyXMark } from "~/components/custom/checkmark";
import { Button } from "~/components/ui/button";
import { LucideEllipsisVertical } from "lucide-react";
import { RowMenu } from "./row_menu";

export const PointerTable = () => {
  const { statuses: rows } = useLoaderData<typeof loader>();
  return (
    <Table>
      <TableCaption>A list of domains.</TableCaption>
      <TableHeader>
        <TableRow className="*:text-center">
          <TableHead>ID</TableHead>
          <TableHead>Domain</TableHead>
          <TableHead>Mailbox Count</TableHead>
          <TableHead>Host Machine Assigned</TableHead>
          <TableHead>Host Machine Status</TableHead>
          <TableHead>Host Machine IPV6 Enabled</TableHead>
          <TableHead>Domain pointer matches host machine IP</TableHead>
          <TableHead>
            Domain pointer matches host machine IP (verified)
          </TableHead>
          <TableHead>Emailwiz set up</TableHead>
          <TableHead>Email Pointers Set up</TableHead>
          <TableHead>Ready for emails</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index} className="*:text-center">
            {/* <TableHead>ID</TableHead> */}
            <TableCell className="font-medium text-right">{row.id}</TableCell>
            {/* <TableHead>Mailbox Count</TableHead> */}
            <TableCell className="text-center">{row.mailboxCount}</TableCell>
            {/* <TableHead>Domain</TableHead> */}
            <TableCell className="text-center">{row.name}</TableCell>
            {/* <TableHead>Host Machine Assigned</TableHead> */}
            <TableCell>{row.vps ? <MyCheckMark /> : "N/A"}</TableCell>
            {/* <TableHead>Host Machine Status</TableHead> */}
            <TableCell>
              {(() => {
                if (row.vps == null) return "N/A";
                if (row.vps.status === "running") return <MyCheckMark />;
                return <MyXMark />;
              })()}
            </TableCell>
            {/* <TableHead>Host Machine IPV6 Enabled</TableHead> */}
            <TableCell>
              {(() => {
                if (row.vps == null) return "N/A";
                if (row.vps.ipv6Enabled) return <MyCheckMark />;
                return <MyXMark />;
              })()}
            </TableCell>
            {/* <TableHead>Domain pointer matches host machine IP</TableHead> */}
            <TableCell>
              {(() => {
                if (row.vps == null) return "N/A";
                if (row.vps.ipReversePointersAreValid) return <MyCheckMark />;
                return <MyXMark />;
              })()}
            </TableCell>
            {/* <TableHead>Domain pointer matches host machine IP (verified)</TableHead> */}
            <TableCell>
              {(() => {
                if (row.vps == null) return "N/A";
                if (row.vps.ipreversPointersValidation) return <MyCheckMark />;
                return <MyXMark />;
              })()}
            </TableCell>
            {/* <TableHead>Emailwiz set up</TableHead> */}
            <TableCell>
              {(() => {
                if (row.vps == null) return "N/A";
                if (row.vps.emailwizInitiated) return <MyCheckMark />;
                return <MyXMark />;
              })()}
            </TableCell>
            {/* <TableHead>Emailwiz set up</TableHead> */}
            <TableCell>
              {(() => {
                if (row.vps == null) return "N/A";
                if (row.vps.pointersSet.allSet) return <MyCheckMark />;
                return <MyXMark />;
              })()}
            </TableCell>
            {/* <TableHead>Ready for emails</TableHead> */}
            <TableCell>
              {(() => {
                if (row.vps == null) return "N/A";
                if (row.vps.readyForEmail) return <MyCheckMark />;
                return <MyXMark />;
              })()}
            </TableCell>
            {/* <TableHead>Actions</TableHead> */}
            <TableCell>
              <RowMenu
                domain={row.name}
                trigger={
                  <Button variant={"ghost"}>
                    <LucideEllipsisVertical className="text-primary h-4" />
                  </Button>
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
