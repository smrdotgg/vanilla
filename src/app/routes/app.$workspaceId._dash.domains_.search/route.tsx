import { LoaderFunctionArgs } from "@remix-run/node";
import { NameCheapDomainService } from "~/sdks/namecheap";
import { prisma } from "~/utils/db";
import { Page } from "./page";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { topDomains } from "~/sdks/namecheap/tlds";

export const loader = async (args: LoaderFunctionArgs) => {
  const { workspaceMembership } = await workspaceGuard(args);
  const query = new URL(args.request.url).searchParams.get("query") ?? "";
  const results = await NameCheapDomainService.checkDomainNameAvailability({
    domains: query.includes(".")
      ? [query]
      : topDomains.map((td) => `${query}${td}`),
  });
  const priceList = results
    ? await prisma.tld_yearly_price_info.findMany({
        include: { tld_price_info: true },
        where: {
          tld_price_info: {
            name: {
              in: results.map((r) => r.Domain.split(".")[1].toLowerCase()),
            },
          },
        },
      })
    : [];

  const resultsWithPrice = results.map((r) => ({
    ...r,
    price: priceList.find(
      (priceInfo) =>
        priceInfo.tld_price_info.name === r.Domain.split(".")[1] &&
        priceInfo.tld_price_info.min_registration_year_count === priceInfo.year
    )!.price,
  }));

  return {
    query,
    resultsWithPrice,
    workspaceId: workspaceMembership.workspace_id,
  };
};

export { Page as default };
