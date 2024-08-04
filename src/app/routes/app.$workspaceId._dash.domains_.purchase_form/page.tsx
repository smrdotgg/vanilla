import { Link, useLoaderData } from "@remix-run/react";
import { loader } from "./route";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { DomainUserInfoForm } from "./components/user_info_form";

export function Page() {
  const { userPurchaseDetails, domainIsAvailable, domain } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-6">
      <div className="mx-auto flex w-full max-w-[81rem] flex-col justify-center  gap-2  py-4">
        <p className="text-4xl">Domain Purchase</p>
        <p className="font-mono text-3xl">{domain}</p>
      </div>
      <Separator />
      <div className="flex  flex-grow  flex-col overflow-y-auto text-5xl ">
        {!domainIsAvailable && <DomainTakenView />}
        {domainIsAvailable && (
          <DomainUserInfoForm
            initialData={{
              city: userPurchaseDetails?.city ?? "",
              country: userPurchaseDetails?.country ?? "",
              address: userPurchaseDetails?.address ?? "",
              last_name: userPurchaseDetails?.last_name ?? "",
              phone_code: userPurchaseDetails?.phone_code ?? "",
              first_name: userPurchaseDetails?.first_name ?? "",
              postal_code: userPurchaseDetails?.postal_code ?? "",
              phone_number: userPurchaseDetails?.phone_number ?? "",
              email_address: userPurchaseDetails?.email_address ?? "",
              state_province: userPurchaseDetails?.state_province ?? "",
            }}
          />
        )}
      </div>
    </div>
  );
}

function DomainTakenView() {
  return (
    <div className="flex  flex-grow flex-col justify-center gap-2 *:mx-auto">
      <p className="text-4xl">Unfortunately this domain has been taken.</p>
      <div className="flex  justify-center gap-2">
        <Button asChild variant="outline">
          <Link to="/">Back to Home</Link>
        </Button>
        <Button asChild>
          <Link to="/domains/search">Shop for more</Link>
        </Button>
      </div>
    </div>
  );
}
