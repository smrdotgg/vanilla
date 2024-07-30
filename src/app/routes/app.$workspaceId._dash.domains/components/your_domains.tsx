import { Input } from "@/components/ui/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { DeleteDomainDialog } from "./delete_domain_dialog";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { loader, action } from "../route";
import { Badge } from "~/components/ui/badge";
import { INTENTS } from "../types";
import { PopoverClose } from "@radix-ui/react-popover";

type RowData = {
  domainId: string;
  name: string;
  mailboxCount: number;
  parsedExpiryDate?: string;
  domainType: DomainType;
};

type DomainType = "platform" | "dns";

export function YourDomains() {
  const { workingDnsDomains } = useLoaderData<typeof loader>();
  const domainRowWidth = "max-w-16";
  return (
    <Table>
      <TableCaption>A list of your domains.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className={domainRowWidth}>Domain</TableHead>
          <TableHead className={domainRowWidth}>Redirect</TableHead>
          <TableHead>Mailbox Count</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead className="text-right">Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workingDnsDomains.map((row, index) => (
          <TableRow key={index}>
            <TableCell className={`font-medium ${domainRowWidth}`}>
              {row.name}
            </TableCell>
            
            <PopoverWrapper
              domainRowWidth={domainRowWidth}
              data={row.rootCnameRecord ?? null}
              domainName={row.name}
            />

            {/* TODO */}
            <TableCell>{row.mailboxCount}</TableCell>

            {/* TODO */}
            <TableCell className="text-gray-500">N/A</TableCell>
            <TableCell className="text-right">
              <DeleteDomainDialog domainId={String(row.id)}>
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

function PopoverWrapper({
  domainRowWidth,
  data,
  domainName,
}: {
  domainRowWidth: string;
  domainName: string;
  data: String | null;
}) {
  const fetcher = useFetcher<typeof action>();

  return (
    <TableCell className={` ${domainRowWidth}`}>
      <Popover>
        <PopoverTrigger>
          <DomainRedirectCell
            domainRowWidth={domainRowWidth}
            data={fetcher.state === "idle" ? data : "Loading..."}
          />
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <fetcher.Form method="post">
            <input value={INTENTS.addRedirectForDomain} name="intent" hidden />
            <input value={domainName} name="domainName" hidden />
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="w-full flex justify-between  *:my-auto">
                  <div className="flex flex-col">
                    <h4 className="font-medium leading-none">Redirect</h4>
                    <p className="text-sm text-muted-foreground">
                      Redirect{" "}
                      <span className="font-mono text-muted-foreground ">
                        domainName
                      </span>{" "}
                      to another URL.
                    </p>
                  </div>
                  <HoverCard>
                    <HoverCardTrigger>
                      <Badge
                        className="font-mono rounded-full px-2"
                        variant={"secondary"}
                      >
                        <p className="text-xs">ALPHA</p>
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p>
                        <span className="font-mono">ALPHA</span> features are a
                        work in progress, and may behave unexpectedly. ALPHA
                        features are an early preview.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Input
                    defaultValue={data ? String(data) : undefined}
                    id="targetUrl"
                    name="targetUrl"
                    autoFocus={true}
                    autoComplete="off"
                    type="text"
                    placeholder="https://example.com"
                    className="col-span-3 h-8 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <PopoverClose asChild>
                  <Button variant={"secondary"}>Cancel</Button>
                </PopoverClose>
                <PopoverClose asChild>
                  <Button type="submit">Save</Button>
                </PopoverClose>
              </div>
            </div>
          </fetcher.Form>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}

function DomainRedirectCell({
  domainRowWidth,
  data,
}: {
  domainRowWidth: string;
  data: String | null;
}) {
  if (!data)
    return (
      <Badge className="text-muted-foreground " variant={"secondary"}>
        None
      </Badge>
    );

  return <Badge>{data}</Badge>;
}
