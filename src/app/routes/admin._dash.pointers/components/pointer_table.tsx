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
import { prefixPlusDomain } from "~/backend/helpers/prefix_plus_domain";

const emailIsReady = (
  row: Awaited<ReturnType<typeof loader>>["statuses"][0]
) => {
  return (
    row.vpsAssigned &&
    row.vpsStatus &&
    row.ipv6Enabled &&
    row.mailDotDomainSetToPointToMachineIp &&
    row.mailDotDomainActuallyPointsToMachineIp &&
    row.emailSoftwareSetUp &&
    row.emailAuthPointersSetToPointCorrectly &&
    row.emailAuthPointersActuallyPointCorrectly
  );
};
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
          <TableHead>Email Pointers Set up (verified)</TableHead>
          <TableHead>Ready for emails</TableHead>

          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index} className="*:text-center">
            {/* <TableHead>ID</TableHead> */}
            <TableCell className="font-medium text-right">{row.id}</TableCell>
            {/* <TableHead>Domain</TableHead> */}
            <TableCell className="text-center">
              {prefixPlusDomain(row.domainPrefix, row.coreDomain)}
            </TableCell>
            {/* <TableHead>Mailbox Count</TableHead> */}
            <TableCell className="text-center">{row.mailboxCount}</TableCell>
            {/* <TableHead>Host Machine Assigned</TableHead> */}

            <TableCell>{row.vpsAssigned ? <MyCheckMark /> : <MyXMark />}</TableCell>
            <TableCell>{row.vpsStatus ? <MyCheckMark /> : <MyXMark />}</TableCell>

            <TableCell>{row.ipv6Enabled ? <MyCheckMark /> :<MyXMark />}</TableCell>
            <TableCell>
              {row.mailDotDomainSetToPointToMachineIp ? <MyCheckMark /> : <MyXMark />}
            </TableCell>

            <TableCell>
              {row.mailDotDomainActuallyPointsToMachineIp ? (
                <MyCheckMark />
              ) : (
                <MyXMark />
              )}
            </TableCell>
            {/* <TableHead>Emailwiz set up</TableHead> */}
            <TableCell>
              {row.emailSoftwareSetUp ? <MyCheckMark /> :<MyXMark />}
            </TableCell>
            <TableCell>
              {row.emailAuthPointersSetToPointCorrectly ? (
                <MyCheckMark />
              ) : (
                <MyXMark />
              )}
            </TableCell>
            <TableCell>
              {row.emailAuthPointersActuallyPointCorrectly ? (
                <MyCheckMark />
              ) : (
                <MyXMark />
              )}
            </TableCell>
            {/* <TableHead>Ready for emails</TableHead> */}
            <TableCell>
              {emailIsReady(row) ? (
                <MyCheckMark />
              ) : (
                <MyXMark />
              )}
            </TableCell>
            {/* <TableHead>Actions</TableHead> */}
            <TableCell>
              <RowMenu
                domain={prefixPlusDomain(row.domainPrefix, row.coreDomain)}
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

