import { useDebounceSubmit } from "remix-utils/use-debounce-submit";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MyBreadCrumb } from "../_dashboard.campaigns_.$id_.stats/components/bc";
import spinnerBlack from "~/assets/spinner-black.svg";
import { Cart } from "./components/cart";
import { FaRegTrashCan } from "react-icons/fa6";
import { TiTick } from "react-icons/ti";
import { loader } from "./route";
import { DomainCheckResult } from "./types";
import { DomainTile } from "./components/domain_tile";


export function ErrorBoundary() {
  return <>error</>;
}


export function Page() {
  const { query } = useLoaderData<typeof loader>();
  const cart: any = [];
  const setCart = (x: any) => {};
  // const submit = useSubmit();

  const submit = useDebounceSubmit();


  const navigation = useNavigation();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("query");

  useEffect(() => {

    if (document) {
      const searchField = document.getElementById("query_input");
      if (searchField instanceof HTMLInputElement) {
        searchField.value = query || "";
      }
    }
  }, [query]);

  return (
    <>
      <div className="flex h-screen max-h-screen flex-col  pt-6">
        <div className="flex justify-between px-6 *:my-auto">
          <div className="flex flex-col">
            <MyBreadCrumb
              data={[
                {
                  name: "Domains",
                  href: "/domains",
                },
                {
                  name: "Purchase New",
                },
              ]}
            />
            <div className="pt-2"></div>
            <p className="text-gray-500"></p>
          </div>
          <Cart cartState={cart} updateCartState={setCart} />
        </div>
        <div className="pt-2"></div>
        <div className="flex flex-grow flex-col  bg-primary-foreground px-6 ">
          <div className={Boolean(query) || searching ? `pt-8` : "h-1/3"}></div>
          <h1 className="mx-auto text-4xl font-bold">
            Find your perfect domain.
          </h1>
          <Form
            className="mx-auto w-full max-w-[50rem] pt-8"
            method="get"
            onChange={(event) => submit(event.currentTarget, { method: "get", debounceTimeout: 500 })}
            role="search"
          >
            <div className="flex gap-2">
              <Input
                defaultValue={query}
                id="query_input"
                name="query"
                placeholder="Search..."
                autoComplete="off"
              />
              <Button
                disabled={searching}
                type="submit"
                className={`flex w-24  ${searching ? "" : ""}`}
              >
                {searching ? (
                  <img src={spinnerBlack} className=" h-full " />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </Form>
          <DomainTile   />
          {/* {!searching && domains && (
            <SearchResults
              domains={domains.map((d:any) => ({
                ...d,
                ErrorNo: String(d.ErrorNo),
                PremiumRegistrationPrice: String(d.PremiumRegistrationPrice),
                PremiumRenewalPrice: String(d.PremiumRenewalPrice),
                PremiumRestorePrice: String(d.PremiumRestorePrice),
                PremiumTransferPrice: String(d.PremiumTransferPrice),
                IcannFee: String(d.IcannFee),
                EapFee: String(d.EapFee),
              }))}
            />
          )} */}
        </div>
      </div>
    </>
  );
}

function SearchResults({ domains }: { domains: DomainCheckResult[] }) {
  const { domainToPriceMap } = useLoaderData<typeof loader>();
  const [added, setAdded] = useState(false);
  const [latestId, setLatestId] = useState(0);
  const cart: any = [];
  const setCart = (x: any) => {};
  return (
    <>
      <div className={domains.length === 0 ? "h-1/3" : "pt-8"}></div>
      <div
        className={` mx-auto flex w-full max-w-[100rem] flex-wrap justify-center  gap-2 ${domains.length === 0 ? "" : ""} `}
      >

      </div>
      <div className="pt-8"></div>
    </>
  );
}
