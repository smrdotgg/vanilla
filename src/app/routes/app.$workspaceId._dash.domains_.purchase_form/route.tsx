// import { Page } from "./page";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { NameCheapDomainService } from "~/sdks/namecheap";
import { prisma } from "~/utils/db";
import { Page } from "./page";
import { INTENTS } from "./types";
import { domainUserInfoZodSchema } from "./components/user_info_form";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await workspaceGuard({ request, params });
  const domain = new URL(request.url).searchParams.get("domain");
  if ((domain?.length ?? 0) === 0) {
    return redirect(
      `/app/${session.workspaceMembership.workspace_id}/domains/search`
    );
  }
  const availabilityResponse = (
    await NameCheapDomainService.checkDomainNameAvailability({
      domains: [domain!],
    })
  )[0]; //.then(results => results.filter(r => r.Domain.toLowerCase() === domain!))
  if (availabilityResponse.Domain.toLowerCase() !== domain)
    throw Error("Domain not found");

  // .then((results) =>
  //   results?.ApiResponse.children[3].CommandResponse.children.filter(
  //     (value) => value.Domain.toLowerCase() === domain?.toLowerCase()
  //   ).map((d) => d.Available)
  // )
  // .then(
  //   (domains) => domains !== undefined && domains?.length > 0 && domains[0]
  // );

  const userPurchaseDetails = await prisma.domain_purchase_form_info.findFirst({
    where: {
      user_old: {
        firebase_id: session.firebaseData.uid,
      },
    },
  });

  return {
    userPurchaseDetails: userPurchaseDetails,
    domainIsAvailable: availabilityResponse.Available,
    domain,
    workspaceId: session.workspaceMembership.workspace_id,
  };
};
export { Page as default };

//
export async function action({ request, params }: ActionFunctionArgs) {
  const session = await workspaceGuard({ request, params });
  const domain = new URL(request.url).searchParams.get("domain");
  const body = await request.json();
  const intent = body["intent"];
  if (intent === INTENTS.UPDATE_DOMAIN_PURCHASE_INFO) {
    const data = domainUserInfoZodSchema.parse(body);
    await prisma.domain_purchase_form_info.upsert({
      where: { user_id: session.user.id },
      create: { ...data, user_id: session.user.id },
      update: data,
    });
    return redirect(
      `/app/${session.workspaceMembership.workspace_id}/domains/checkout?domain=${domain}`
    );
  }
  return null;
}
