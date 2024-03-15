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
import { useState } from "react";
import { Switch } from "@radix-ui/react-switch";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

export function SampleShow({
  data,
  headers,
  mapping,
}: {
  data: ParseResult<any>;
  headers: string[];
  mapping: CsvToModelMapping;
}) {
  const [showAll, setShowAll] = useState(false);
  const breakpoint = 10;

  return (
    <div className="flex max-h-[calc(100vh-8rem)] flex-col gap-2 overflow-y-auto">
      {data.data.length > breakpoint ? (
        <div className="flex gap-2 px-2 *:my-auto">
          <p>Show all</p>
          <Checkbox
            value={Number(showAll)}
            onCheckedChange={(_) => setShowAll(!showAll)}
          />
        </div>
      ) : (
        <></>
      )}
      <Table>
        <TableCaption>
          A Sample look of what your data will look like
        </TableCaption>
        <TableHeader>
          <TableRow className="*:max-w-20">
            <TableHead>No.</TableHead>
            {Object.entries(mapping).map((h, i) => (
              <TableHead key={i}>{camelCaseToTitle(h[0])}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data
            .slice(0, showAll ? undefined : breakpoint)
            .map((row, index) => {
              return (
                <TableRow key={index}>
                  <TableCell className={`text-gray-500`}>
                    {index + 1}.
                  </TableCell>
                  {Object.entries(mapping).map(([v, k], i) => (
                    <TableCell
                      key={i}
                      className={row[k] ? "" : `text-gray-500`}
                    >
                      {row[k] ?? "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
function camelCaseToTitle(camelCaseString: string): string {
  return (
    camelCaseString
      // Insert a space before all caps
      .replace(/([A-Z])/g, " $1")
      // Trim the start of the string
      .trim()
      // Capitalize the first letter of each word
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/ (\w)/g, (match, p1) => ` ${p1.toUpperCase()}`)
  );
}
