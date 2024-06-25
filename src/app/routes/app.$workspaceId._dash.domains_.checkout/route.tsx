import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { NameCheapDomainService } from "~/sdks/namecheap";
import { z } from "zod";
import { prisma } from "~/utils/db";
import { Page } from "./page";
import { INTENTS } from "./types";

const nameSchema = z
  .string()
  .min(2)
  .max(30)
  .refine((value) => value !== "undefined")
  .refine((value) => value !== "null");

export const loader = async (args: LoaderFunctionArgs) => {
  const session = await workspaceGuard(args);
  const { data, success } = nameSchema.safeParse(
    new URL(args.request.url).searchParams.get("domain")
  );
  if (!success)
    return redirect(
      `/app/${session.workspaceMembership.workspace_id}/domains/search`
    );

  const { name, availability } =
    await NameCheapDomainService.checkDomainNameAvailability({
      domains: [data],
    }).then((r) => ({
      availability: r.CommandResponse?.DomainCheckResults[0].Available,
      name: r.CommandResponse?.DomainCheckResults[0].Domain,
    }));

  if (name === undefined || availability === undefined) {
    throw Error("Domain Info not found.");
  }

  const priceInfo = (await prisma.tld_price_info.findFirst({
    where: { name: name!.split(".")[1] },
    include: { tld_yearly_price_info: true },
  }))!;
  const price = priceInfo.tld_yearly_price_info.find(
    (yearlyPrice) => yearlyPrice.year === priceInfo.min_registration_year_count
  )!.price;

  return {
    availability,
    name,
    price,
  };
};

export { Page as default };

export const action = async (args: ActionFunctionArgs) => {
  const session = await workspaceGuard(args);
  const formData = await args.request.formData();
  if (formData.get("intent") === INTENTS.purchaseDomain) {
    const domain = String(formData.get("domain"));
    await NameCheapDomainService.purchaseDomain({
      workspaceId: String(session.workspaceMembership.workspace_id),
      userId: String(session.user.id),
      domainName: domain,
    });
    return redirect(`/app/${session.workspaceMembership.workspace_id}/domains`);
  }
  return null;
};
