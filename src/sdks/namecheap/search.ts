import { topDomains } from "./tlds";
import { checkDomainNameAvailability } from "./check_domain_availability";
export const domainSearch = async ({query}:{query:string}) => {
  // const queryFormData = new URL(request.url).searchParams.get("query");
  // if (queryFormData == null || String(queryFormData).length === 0) {
  //   return null;
  // }
  if (query.length === 0) return [];

  const domains = query.includes(".")
    ? [query]
    : topDomains.map((td) => query + td);
  const val = await checkDomainNameAvailability({ domains });
  return val.CommandResponse!.DomainCheckResults;
};
