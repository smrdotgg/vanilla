import { Page } from "./page";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { checkDomainAvailability } from "../_dashboard.domains_.search/helpers.server";
import { getDomainToPriceMap } from "../_dashboard.domains_.search/helpers.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const domainNameQuery = new URL(request.url).searchParams.get("domain");
  if ((domainNameQuery?.length ?? 0) === 0) {
    return redirect("/domains/search");
  }

  const domainData = checkDomainAvailability({
    domains: [domainNameQuery!],
  })
    .then((results) =>
      results?.CommandResponse?.DomainCheckResults.filter(
        (value) =>
          value.Domain.toLowerCase() === domainNameQuery?.toLowerCase(),
      ),
    )
    .then(async (domainObjects) => {
      if (
        domainObjects === undefined ||
        domainObjects.length === 0 ||
        domainNameQuery !== domainObjects[0].Domain
      ) {
        return undefined;
        // return undefined;
      }
      const domainNames = domainObjects.map((d) => d.Domain);
      const domainToPriceMap = await getDomainToPriceMap(domainNames);
      return {
        available: domainObjects[0].Available,
        price: domainToPriceMap[domainNames[0]],
        name: domainNames,
      };
    });

  return {
    domainData: await domainData,
  };
};

export { Page as default };

export const action = async (args: ActionFunctionArgs) => {};
