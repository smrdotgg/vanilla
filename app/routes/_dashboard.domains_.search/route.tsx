import { ActionFunctionArgs, LoaderFunctionArgs, defer } from "@remix-run/node";
import { Page } from "./page";
import { INTENTS } from "./types";
import { getData, getDomainToPriceMap } from "./helpers.server";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";

type LoaderResponse = {
  results: Awaited<ReturnType<typeof getData>>;
  query: string;
  domainToPriceMap: {
    [key: string]: { name: string; price: number; time: number };
  };
};

const globalForDb = globalThis as unknown as {
  conn: { [key: string]: LoaderResponse } | undefined;
};


export const loader = async (args: LoaderFunctionArgs) => {
  const query = new URL(args.request.url).searchParams.get("query") ?? "";
  console.log(`Query received: ${query}`);


  console.log(`Cache miss for query: ${query}. Fetching data...`);
  const results = getData(args.request);

  results.then((res) => console.log(`results: ${JSON.stringify(res)}`));

  const domains = results.then((results) => {
    const domainList = results?.CommandResponse?.DomainCheckResults.map(
      (d) => d.Domain,
    );
    console.log("Domains:", domainList);
    return domainList;
  });

  const domainToPriceMap = domains.then((domains) => {
    const domainPriceMap = getDomainToPriceMap(domains);
    console.log("Domain to Price Map:", domainPriceMap);
    return domainPriceMap;
  });



  return {
    query: query,
    results: await results,
    domainToPriceMap: await domainToPriceMap,
  };
};

export { Page as default };

export const action = async ({ request }: ActionFunctionArgs) => {
  await validateSessionAndRedirectIfInvalid(request);

  const formData = await request.formData();
  const intent = String(formData.get("intent"));
  if (intent === INTENTS.search) {
    const query = String(formData.get("query"));
  }
  return null;
};
