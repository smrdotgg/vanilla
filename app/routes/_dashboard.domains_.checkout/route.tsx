import { Page } from "./page";
import {
  redirect,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  getDomainToPriceMap,
  checkDomainAvailability,
} from "../_dashboard.domains_.search/helpers.server";
import { INTENTS } from "./types";
import { api } from "~/server/trpc/server.server";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { COOKIES } from "~/cookies/workspace";
import { prisma } from "~/db/prisma";

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
      const regularDomainPriceMap = await getDomainToPriceMap(domainNames);
      const x: [string, { price: number; name: string; time: number }][] =
        Object.entries(regularDomainPriceMap).map(([name, proposedPrice]) => {
          const premiumPrice = domainObjects?.find(
            (d) => d.Domain === name,
          )?.PremiumRegistrationPrice;
          if (Number(premiumPrice))
            return [name, { ...proposedPrice, price: premiumPrice! }];
          else return [name, proposedPrice];
        });
      const mergedDomainPriceMap = Object.fromEntries(x);

      return {

        available: domainObjects[0].Available,
        price: mergedDomainPriceMap[domainNames[0]],
        name: domainObjects[0].Domain,
      };
    });
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await COOKIES.selected_workspace_id.parse(cookieHeader)) || {};
  console.log("Parsed cookie:", cookie);

  const selected_workspace_id = String(cookie.selected_workspace_id);

  // Return the domain data
  return {
    selectedWorkspaceId: selected_workspace_id,
    domainData: await domainData,
  };
};

export { Page as default };
export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Starting action function...");

  const body = await request.formData();
  console.log("Received form data:", body);

  if (body.get("intent") === INTENTS.purchaseDomain) {
    console.log("Intent is to purchase domain...");

    const domain = body.get("domain");
    console.log("Domain to purchase:", domain);

    const { uid } = await validateSessionAndRedirectIfInvalid(request);
    console.log("User ID:", uid);

    const user = await prisma.user.findFirst({ where: { firebase_id: uid } });
    console.log("User details:", user);

    if (!user) throw Error("User not found");

    const cookieHeader = request.headers.get("Cookie");
    console.log("Cookie header:", cookieHeader);

    const cookie =
      (await COOKIES.selected_workspace_id.parse(cookieHeader)) || {};
    console.log("Parsed cookie:", cookie);

    const selected_workspace_id = String(cookie.selected_workspace_id);
    console.log("Selected workspace ID:", selected_workspace_id);

    if (
      selected_workspace_id === "undefined" ||
      selected_workspace_id === "null" ||
      selected_workspace_id.length === 0 ||
      selected_workspace_id === "NaN"
    )
      throw Error("Workspace not selected in header");

    console.log("Workspace ID is valid.");

    await api(request).domains.purchaseDomain.mutate({
      userId: String(user.id),
      workspaceId: selected_workspace_id,
      domainName: String(domain),
    });

    console.log("Domain purchase mutation successful.");

    return redirect("/domains");
  } else {
    console.log("Unhandled intent: ", body.get("intent"));
  }

  return null;
};
