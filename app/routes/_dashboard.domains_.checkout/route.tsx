import { Page } from "./page";
import {
  redirect,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { getDomainToPriceMap ,checkDomainAvailability } from "../_dashboard.domains_.search/helpers.server";
import { INTENTS } from "./types";
import { getCookieSessionOrThrow } from "~/server/auth.server";
import { api } from "~/server/trpc/server.server";

// Define the loader function to process domain search requests
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Extract the domain name query from the request URL
  const domainNameQuery = new URL(request.url).searchParams.get("domain");
  // Redirect if no domain query is provided
  if ((domainNameQuery?.length ?? 0) === 0) {
    return redirect("/domains/search");
  }

  // Check the availability of the queried domain
  const domainData = checkDomainAvailability({
    domains: [domainNameQuery!],
  })
    // Filter results to find the matching domain
    .then((results) =>
      results?.CommandResponse?.DomainCheckResults.filter(
        (value) =>
          value.Domain.toLowerCase() === domainNameQuery?.toLowerCase(),
      ),
    )
    .then(async (domainObjects) => {
      // Handle cases where no matching domains are found
      if (
        domainObjects === undefined ||
        domainObjects.length === 0 ||
        domainNameQuery !== domainObjects[0].Domain
      ) {
        return undefined;
      }
      // If a domain is found, get the list of domain names
      const domainNames = domainObjects.map((d) => d.Domain);
      // Retrieve pricing information for the found domain
      const domainToPriceMap = await getDomainToPriceMap(domainNames);
      return {
        available: domainObjects[0].Available,
        price: domainToPriceMap[domainNames[0]],
        name: domainObjects[0].Domain,
      };
    });

  // Return the domain data
  return {
    domainData: await domainData,
  };
};


export { Page as default };


export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();
  if (body.get("intent") === INTENTS.purchaseDomain) {
    const domain = body.get("domain");
    const { user } = await getCookieSessionOrThrow(request);
    await api(request).domains.purchaseDomain.mutate({
      userId: user.id,
      domainName: String(domain),
    });
    return redirect("/domains");
  } else {
    console.log("Unhandled intent: ", body.get("intent"));
  }

  return null;
};
