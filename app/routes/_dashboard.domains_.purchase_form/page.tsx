import { Link, useLoaderData } from "@remix-run/react";
import { loader } from "./route";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  DomainUserInfoForm,
  domainUserInfoZodSchema,
} from "./components/domain_user_info_form";

export function Page() {
  const { userPurchaseDetails, domainIsAvailable, domain } =
    useLoaderData<typeof loader>();

  // const { error } = domainUserInfoZodSchema.safeParse(userPurchaseDetails);

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
            initialData={
              {
                techCity: userPurchaseDetails?.tech_city ?? "",
                adminCity: userPurchaseDetails?.admin_city ?? "",
                billingCity: userPurchaseDetails?.billing_city ?? "",
                techCountry: userPurchaseDetails?.tech_country ?? "",
                adminCountry: userPurchaseDetails?.admin_country ?? "",
                techAddress1: userPurchaseDetails?.tech_address_1 ?? "",
                techLastName: userPurchaseDetails?.tech_last_name ?? "",
                adminAddress1: userPurchaseDetails?.admin_address_1 ?? "",
                adminLastName: userPurchaseDetails?.admin_last_name ?? "",
                techFirstName: userPurchaseDetails?.tech_first_name ?? "",
                adminFirstName: userPurchaseDetails?.admin_first_name ?? "",
                billingCountry: userPurchaseDetails?.billing_country ?? "",
                registrantCity: userPurchaseDetails?.registrant_city ?? "",
                techPostalCode: userPurchaseDetails?.tech_postal_code ?? "",
                adminPostalCode: userPurchaseDetails?.admin_postal_code ?? "",
                billingAddress1: userPurchaseDetails?.billing_address_1 ?? "",
                billingLastName: userPurchaseDetails?.billing_last_name ?? "",
                techPhoneNumber: userPurchaseDetails?.tech_phone_number ?? "",
                adminPhoneNumber: userPurchaseDetails?.admin_phone_number ?? "",
                billingFirstName: userPurchaseDetails?.billing_first_name ?? "",
                techEmailAddress: userPurchaseDetails?.tech_email_address ?? "",
                adminEmailAddress:
                  userPurchaseDetails?.admin_email_address ?? "",
                billingPostalCode:
                  userPurchaseDetails?.billing_postal_code ?? "",
                registrantCountry:
                  userPurchaseDetails?.registrant_country ?? "",
                techStateProvince:
                  userPurchaseDetails?.tech_state_province ?? "",
                adminStateProvince:
                  userPurchaseDetails?.admin_state_province ?? "",
                billingPhoneNumber:
                  userPurchaseDetails?.billing_phone_number ?? "",
                registrantAddress1:
                  userPurchaseDetails?.registrant_address_1 ?? "",
                registrantLastName:
                  userPurchaseDetails?.registrant_last_name ?? "",
                registrantFirstName:
                  userPurchaseDetails?.registrant_first_name ?? "",
                billingEmailAddress:
                  userPurchaseDetails?.billing_email_address ?? "",
                billingStateProvince:
                  userPurchaseDetails?.billing_state_province ?? "",
                registrantPostalCode:
                  userPurchaseDetails?.registrant_postal_code ?? "",
                techPhoneCountryCode:
                  userPurchaseDetails?.tech_phone_country_code ?? "",
                adminPhoneCountryCode:
                  userPurchaseDetails?.admin_phone_country_code ?? "",
                registrantPhoneNumber:
                  userPurchaseDetails?.registrant_phone_number ?? "",
                registrantEmailAddress:
                  userPurchaseDetails?.registrant_email_address ?? "",
                billingPhoneCountryCode:
                  userPurchaseDetails?.billing_phone_country_code ?? "",
                registrantStateProvince:
                  userPurchaseDetails?.registrant_state_province ?? "",
                registrantPhoneCountryCode:
                  userPurchaseDetails?.registrant_phone_country_code ?? "",
              }
              // {
              //   techCity: userPurchaseDetails?.techCity ?? "",
              // }
            }
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
