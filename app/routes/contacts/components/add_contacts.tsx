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
import { AcceptUserCSVConfig, CsvToModelMapping } from "./mapping";
import { SampleShow } from "./sample";
import { FileAccept, FileAcceptSmall } from "./file_accept";
const { parse } = pkg;

export function DialogCloseButton({
  onSubmit,
}: {
  onSubmit: (
    data: { name: string; email: string; company: string }[],
  ) => Promise<void> | void;
}) {
  const [data, setData] = useState<ParseResult<unknown> | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<CsvToModelMapping>({
    name: "",
    email: "",
    companyName: "",
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
        <Button>Import contacts from CSV</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="  flex-grow">
          <DialogTitle>Upload your contacts in CSV format.</DialogTitle>
        </DialogHeader>
        {(() => {
          return data != null ? (
            <div className="flex flex-grow flex-col justify-between gap-4">
              <div>
                <AcceptUserCSVConfig
                  headers={headers}
                  mapping={mapping}
                  commitMapping={setMapping}
                />
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
                          const x = data.data
                            .map((row: any, _) => {
                              const x = {
                                name: String(row[mapping.name]),
                                email: String(row[mapping.email]),
                                company: String(row[mapping.companyName]),
                              };
                              return x;
                            })
                            .filter((i) => i.name.length);
                          console.log("SENDING");
                          console.log(JSON.stringify(x));
                          // setData(null);
                          onSubmit(x);
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
