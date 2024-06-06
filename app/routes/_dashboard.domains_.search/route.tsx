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
  const results = await getData(args.request);
  console.log(`results: ${JSON.stringify(results)}`);
  const domains = results?.CommandResponse?.DomainCheckResults;
  const domainNames = domains?.map((d) => d.Domain);
  console.log("Domains: ", domains);

  const domainPriceMap = await getDomainToPriceMap(domainNames);

  const x: [string, { price: number; name: string; time: number }][] =
    Object.entries(domainPriceMap).map(([name, proposedPrice]) => {
      const premiumPrice = domains?.find(
        (d) => d.Domain === name,
      )?.PremiumRegistrationPrice;
      if (Number(premiumPrice))
        return [name, { ...proposedPrice, price: premiumPrice! }];
      else return [name, proposedPrice];
    });
  const y = Object.fromEntries(x);

  return {
    query,
    domains,
    results,
    domainPriceMap: y,
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
