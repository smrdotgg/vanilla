import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import whois from "whois-json";

// import * as whois from "whois-json";
//
export const loader = async (args: LoaderFunctionArgs) => {
  const domains = ["steliade.com"];
  const data = await Promise.all(domains.map((d) => whois(d)));
  return { data };
};

// async function checkDomainTransfer(domain:string) {
//   try {
//     const data = await whois(domain);
//     const isTransferable = data.status && data.status.includes('ok') && !data.status.includes('clientTransferProhibited');
//     const isOldEnough = new Date() - new Date(data.creationDate) > 60 * 24 * 60 * 60 * 1000;
//     console.log(`Transferable: ${isTransferable && isOldEnough}`);
//   } catch (error) {
//     console.error('Error fetching WHOIS data:', error);
//   }
// }

export default function Page() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div className="h-screen overflow-y-scroll">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
