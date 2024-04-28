/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { ParseResult } from "papaparse";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { CsvToModelMapping } from "./mapping";

export function SampleShow({
  data,
  headers,
  mapping,
}: {
  data: ParseResult<any>;
  headers: string[];
  mapping: CsvToModelMapping;
}) {
  return (
    <>
      <Table>
        <TableCaption>
          A Sample look of what your data will look like
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.slice(0, 10).map((row, index) => {
            return (
              <TableRow index={index}>
                <TableCell className={row[mapping.name] ? "" : `text-gray-500`}>
                  {row[mapping.name] ?? "N/A"}
                </TableCell>
                <TableCell
                  className={row[mapping.email] ? "" : `text-gray-500`}
                >
                  {row[mapping.email] ?? "N/A"}
                </TableCell>
                <TableCell
                  className={row[mapping.companyName] ? "" : `text-gray-500`}
                >
                  {row[mapping.companyName] ?? "N/A"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
