/* eslint-disable @typescript-eslint/no-explicit-any */
import { CopyIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import pkg from "papaparse";

import type { ParseResult } from "papaparse";
import { useState } from "react";

import { SampleShow } from "./sample";
import { AcceptUserCSVConfig, CsvToModelMapping } from "./mapping";
import { FileAccept, FileAcceptSmall } from "./file_accept";
import { z } from "zod";
const { parse } = pkg;

export function BulkButton({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof rowSchema>[]) => Promise<void> | void;
}) {
  const [data, setData] = useState<ParseResult<unknown> | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<CsvToModelMapping>({
    fromName: "",
    fromEmail: "",
    userName: "",
    password: "",
    smtpHost: "",
    smtpPort: "",
    imapHost: "",
    imapPort: "",
  });

  const updateParsedData = (file: File) => {
    if (file != null)
      parse(file, {
        complete: (result: ParseResult<any>) => {
          if (result.data.length != 0) {
            setHeaders(Object.keys(result.data[0]));
            setData(result);
          }
        },
        header: true,
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Import sender accounts from CSV</Button>
      </DialogTrigger>
      <DialogContent className="flex h-screen w-screen min-w-full flex-col">
        <DialogHeader className=" h-10">
          <DialogTitle>Upload your contacts in CSV format.</DialogTitle>
        </DialogHeader>
        {(() => {
          return data != null ? (
            <div className="flex max-h-full  w-full max-w-full flex-grow flex-col justify-between gap-4 p-1">
              <div className="mb-auto flex h-full">
                <AcceptUserCSVConfig
                  headers={headers}
                  mapping={mapping}
                  commitMapping={setMapping}
                />
                <div className="min-h-full bg-primary pl-[.5px]"></div>
                <SampleShow data={data} headers={headers} mapping={mapping} />
              </div>
              <DialogFooter className="sm:justify-between">
                <FileAcceptSmall setData={updateParsedData} />
                <div className="flex gap-2 ">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      onClick={() => setData(null)}
                      variant={"secondary"}
                    >
                      Cancel
                    </Button>
                  </DialogClose>

                  <DialogClose asChild>
                    <Button
                      type="button"
                      onClick={() => {
                        onSubmit(
                          data.data
                            .filter((row: any) =>
                              Object.entries(mapping).every(
                                ([key, value]) =>
                                  row[value] &&
                                  String(row[value]).trim() !== "",
                              ),
                            )
                            .map((row: any) => ({
                              fromName: String(row[mapping.fromName]),
                              fromEmail: String(row[mapping.fromEmail]),
                              userName: String(row[mapping.userName]),
                              password: String(row[mapping.password]),
                              smtpHost: String(row[mapping.smtpHost]),
                              smtpPort: Number(row[mapping.smtpPort]),
                              imapHost: String(row[mapping.imapHost]),
                              imapPort: Number(row[mapping.imapPort]),
                            })),
                        );
                      }}
                    >
                      Submit
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </div>
          ) : (
            <FileAccept setData={updateParsedData} />
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}

export const rowSchema = z.object({
  fromName: z.string(),
  fromEmail: z.string().email(),
  userName: z.string(),
  password: z.string(),
  smtpHost: z.string(),
  smtpPort: z.number(),
  imapHost: z.string(),
  imapPort: z.number(),
});
