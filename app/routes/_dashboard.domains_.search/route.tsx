import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  defer,
} from "@remix-run/node";
import { Page } from "./page";
import { INTENTS } from "./types";
import { getCookieSessionOrThrow } from "~/server/auth.server";
import { getData, getTldPrice } from "./helpers.server";

type LoaderResponse = {
  results: ReturnType<typeof getData>;
  query: string;
  domainToPriceMap: Promise<{
    [key: string]: number;
  }>;
};

const globalForDb = globalThis as unknown as {
  conn: { [key: string]: LoaderResponse } | undefined;
};

let cache = globalForDb.conn ?? {};

const getDomainToPriceMap = async (domains: string[] | undefined) => {
  const domainToPriceMap: { [key: string]: number } = {};
  if (domains) {
    for (let domain of domains) {
      const price = await getTldPrice(domain.split(".")[1]);
      if (price !== null) {
        domainToPriceMap[domain] = price;
      }
    }
  }
  return domainToPriceMap;
};

export const loader = (args: LoaderFunctionArgs) => {
  const queryFormData = new URL(args.request.url).searchParams.get("query");
  let query: string;
  if (queryFormData == null || String(queryFormData).length === 0) {
    query = "";
  } else {
    query = String(queryFormData);
  }
  if (cache[query] !== undefined) {
    return defer({ ...cache[query]! });
  }
  const results = getData(args.request);
  const domains = results.then((results) =>
    results?.CommandResponse?.DomainCheckResults.map((d) => d.Domain),
  );
  const domainToPriceMap = domains.then((domains) =>
    getDomainToPriceMap(domains),
  );
  cache[query] = {
    query,
    results,
    domainToPriceMap,
  };

  return defer({
    results,
    query,
    domainToPriceMap,
  });
};

export { Page as default };
export const action = async (args: ActionFunctionArgs) => {
  const user = await getCookieSessionOrThrow(args.request);
  const formData = await args.request.formData();
  const intent = String(formData.get("intent"));
  if (intent === INTENTS.search) {
    const query = String(formData.get("query"));
  }
  return null;
};
