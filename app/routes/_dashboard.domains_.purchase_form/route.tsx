import { Page } from "./page";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { checkDomainAvailability } from "../_dashboard.domains_.search/helpers.server";
import { getCookieSessionOrThrow } from "~/server/auth.server";
import { db } from "~/db/index.server";
import { TB_domainPurchaseDetails } from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { INTENTS } from "./types";
import { api } from "~/server/trpc/server.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const domain = new URL(request.url).searchParams.get("domain");
  if ((domain?.length ?? 0) === 0) {
    return redirect("/domains/search");
  }
  const domainIsAvailable = checkDomainAvailability({ domains: [domain!] })
    .then((results) =>
      results?.CommandResponse?.DomainCheckResults.filter(
        (value) => value.Domain.toLowerCase() === domain?.toLowerCase(),
      ).map((d) => d.Available),
    )
    .then(
      (domains) => domains !== undefined && domains?.length > 0 && domains[0],
    );
  const userPurchaseDetails = getCookieSessionOrThrow(request)
    .then(async (session) => {
      const x = await db
        .select()
        .from(TB_domainPurchaseDetails)
        .where(eq(TB_domainPurchaseDetails.userId, session.user.id));
      console.log(`GOT X = ${JSON.stringify(x)}`);
      console.log(`compairng TB_domainPurchaseDetails.userId, ${session.id}`);
      return x;
    })
    .then((results) => {
      if (results.length === 0) return null;
      return results[0];
    });
  return {
    userPurchaseDetails: await userPurchaseDetails,
    domainIsAvailable: await domainIsAvailable,
    domain,
  };
};

export { Page as default };

export async function action({ context, params, request }: ActionFunctionArgs) {
  const body = await request.json();
  const domain = (new URL(request.url)).searchParams.get("domain");
  if (body["intent"] === INTENTS.UPDATE_DOMAIN_PURCHASE_INFO) {
    await api(request).domains.setDomainUserInfo.mutate(body);
    return redirect(`/domains/checkout?domain=${domain}`);
  }
  return null;
}
