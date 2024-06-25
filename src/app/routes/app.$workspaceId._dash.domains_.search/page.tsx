/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useDebounceSubmit } from "remix-utils/use-debounce-submit";
import { ReactNode, useState } from "react";
import { loader } from "./route";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function ErrorBoundary() {
  return <>error</>;
}

export function Page() {
  const { query } = useLoaderData<typeof loader>();

  const { state } = useNavigation();

  const isLoading = state !== "idle";

  return (
    <div className=" flex w-full flex-col ">
      <div className="m-auto">
        <h1 className="text-center text-4xl font-bold">
          Search for your perfect domain.
        </h1>
        <div className="pt-5"></div>
        <Form>
          <div className="mx-auto flex max-w-[50rem] gap-2">
            <Input
              type="text"
              disabled={isLoading}
              defaultValue={query}
              name="query"
            />
            <Button disabled={isLoading} className="w-32" type="submit">
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </Form>
        <div className="pt-8"></div>
        <SearchResults />
      </div>
    </div>
  );
}

function SearchResults() {
  const { resultsWithPrice } = useLoaderData<typeof loader>();
  return (
    <>
      <div className=" mx-auto grid w-[70rem]  grid-cols-3 gap-2">
        {resultsWithPrice.map((domain, index) =>
          domain.Available ? (
            <WrapInPopover key={index} domain={domain.Domain}>
              <SingleSearchResult index={index} />
            </WrapInPopover>
          ) : (
            <SingleSearchResult key={index} index={index} />
          )
        )}
      </div>
      <div className="pt-8"></div>
    </>
  );
}

function SingleSearchResult({ index }: { index: number }) {
  const { resultsWithPrice } = useLoaderData<typeof loader>();
  const domain = resultsWithPrice[index];

  return (
    <div
      className={`flex justify-between border border-gray-700 px-4 py-2 ${
        domain.Available ? "" : "line-through cursor-not-allowed  text-gray-400"
      }`}
    >
      <p>{domain.Domain}</p>
      <p className="font-mono">
        {/* fancy .99 way of displaying price */}${domain.price - 1}.99
      </p>
    </div>
  );
}

function WrapInPopover({
  domain,
  children,
}: {
  domain: string;
  children: ReactNode;
}) {
  const { workspaceId } = useLoaderData<typeof loader>();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={`flex cursor-pointer px-0 *:w-full ${
            open ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Purchase</h4>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to purchase this domain?
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpen(false)} variant={"secondary"}>
                Cancel
              </Button>
              <Button asChild>
                {/* domain */}
                <Link
                  to={`/app/${workspaceId}/domains/purchase_form?domain=${domain}`}
                >
                  Purchase
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
