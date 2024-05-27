import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Suspense, useState } from "react";
import { Await, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { loader } from "./../route";
import { useTheme } from "remix-themes";

export function DomainTile() {
  const { results } = useLoaderData<typeof loader>();
  const [openedDomain, setOpenedDomain] = useState<string | undefined>();

  return (
    <>
      <Suspense fallback={<>loading...</>}>
        <Await resolve={results}>
          {(results) => (
            <div
              className={
                results?.CommandResponse?.DomainCheckResults?.length === 0
                  ? "h-1/3"
                  : "pt-8"
              }
            ></div>
          )}
        </Await>
      </Suspense>
      <div
        className={` mx-auto flex w-full max-w-[100rem] flex-wrap gap-2 *:min-w-[30rem]   *:flex-grow  `}
      >
        <Suspense fallback={<></>}>
          <Await resolve={results}>
            {(results) =>
              results?.CommandResponse?.DomainCheckResults?.map(
                (d, index: number) => {
                  return (
                  <div key={index}>
                    <TileCore
                      index={index}
                      isAvailable={d.Available}
                      name={d.Domain}
                      opened={openedDomain === d.Domain}
                      setOpened={setOpenedDomain}
                    />
                  </div>
                  );
                },
              )
            }
          </Await>
        </Suspense>
      </div>
      <div className="pt-8"></div>
    </>
  );
}

function TileCore({
  name,
  isAvailable,
  index,
  opened,
  setOpened,
}: {
  isAvailable: boolean;
  name: string;
  index: number;
  opened: boolean;
  setOpened: (x: string | undefined) => void;
}) {
  const { domainToPriceMap } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("query");
  const [theme] = useTheme();
  const twindClass = `flex h-20 w-full w-[30rem] max-w-[30rem] justify-between  gap-1 rounded border  px-4 py-5 align-top *:my-auto ${opened ? "bg-primary" : ""}  ${isAvailable ? "" : " opacity-50 "}`;

  const textColor = () => {
    if (!isAvailable) return "text-gray-500 line-through";
    if (opened) {
      if (theme === "light") {
        return "text-white";
      } else {
        return "text-black";
      }
    }
  };

  const coreComponent = (
    <>
      <div
        key={index}
        className={isAvailable ? "flex w-full justify-between" : twindClass}
      >
        <p
          className={` ${opened ? "text-xl font-bold" : "text-md"} ${textColor()}  `}
        >
          {name}
        </p>
        {isAvailable ? (
          <Suspense fallback={<></>}>
            <Await
              resolve={
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                !searching ? domainToPriceMap : (new Promise(() => {}) as any)
              }
            >
              {(priceMap) => (
                <div className="flex gap-2 *:my-auto">
                  <p
                    className={`text-md ${opened ? `${theme === "light" ? "text-white" : "text-black"}` : "text-primary"}`}
                  >
                    $
                    {priceMap[name] === undefined
                      ? "N/A"
                      : priceMap[name].toString()}
                    /yr
                  </p>
                </div>
              )}
            </Await>
          </Suspense>
        ) : (
          <></>
        )}
      </div>
    </>
  );

  if (isAvailable) {
    return (
      <Popover
        open={opened}
        key={index}
        onOpenChange={() => (opened ? setOpened(undefined) : setOpened(name))}
      >
        <PopoverTrigger className={twindClass}>{coreComponent}</PopoverTrigger>
        <PopoverContent className="w-[20rem]">
          <p>Are you sure you want to purchase this domain?</p>
          <div className="pt-2"></div>
          <p className="font-mono text-2xl">
            <Suspense fallback={name}>
              <Await resolve={domainToPriceMap}>
                {(priceMap) => `Price: $${priceMap[name]}`}
              </Await>
            </Suspense>
          </p>
          <div className="pt-6"></div>
          <div className="flex justify-end gap-2">
            <Button variant={"secondary"} onClick={() => setOpened(undefined)}>
              Cancel
            </Button>
            <Link
              onClick={() => setOpened(undefined)}
              to={`/domains/purchase_form?domain=${name}`}
            >
              <Button variant={"default"}>Purchase</Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    );
  } else {
    return coreComponent;
  }
}
