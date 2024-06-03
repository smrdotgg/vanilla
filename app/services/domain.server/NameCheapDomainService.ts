import {
  DomainServiceInterface,
  nameCheapBaseUrl,
  parsePurchaseResponse,
} from ".";
import { prisma } from "~/db/prisma";

// document function below
// https://www.namecheap.com/support/api/methods/domains-dns/set-hosts.aspx
export const NameCheapDomainService: DomainServiceInterface = {
  purchaseDomain: async ({ domainName, userId, workspaceId }) => {
    console.log("[NameCheapDomainService] Starting purchaseDomain function...");

    const detail = await prisma.domain_purchase_form_info.findFirst({
      where: { user_old: { id: Number(userId) } },
    });
    console.log("[NameCheapDomainService] User detail:", detail);

    if (detail === null) throw Error("User Detail info not found");

    const apiData: { [key: string]: string | number | null } = {
      DomainName: domainName,
      Years: 1,
      RegistrantFirstName: detail.registrant_first_name,
      RegistrantLastName: detail.registrant_last_name,
      RegistrantAddress1: detail.registrant_address_1,
      RegistrantCity: detail.registrant_city,
      RegistrantStateProvince: detail.registrant_state_province,
      RegistrantPostalCode: detail.registrant_postal_code,
      RegistrantCountry: detail.registrant_country,
      RegistrantPhone:
        detail.registrant_phone_country_code +
        "." +
        detail.registrant_phone_number,
      RegistrantEmailAddress: detail.registrant_email_address,

      TechFirstName: detail.tech_first_name,
      TechLastName: detail.tech_last_name,
      TechAddress1: detail.tech_address_1,
      TechCity: detail.tech_city,
      TechStateProvince: detail.tech_state_province,
      TechPostalCode: detail.tech_postal_code,
      TechCountry: detail.tech_country,
      TechPhone:
        detail.tech_phone_country_code + "." + detail.tech_phone_number,
      TechEmailAddress: detail.tech_email_address,

      AdminFirstName: detail.admin_first_name,
      AdminLastName: detail.admin_last_name,
      AdminAddress1: detail.admin_address_1,
      AdminCity: detail.admin_city,
      AdminStateProvince: detail.admin_state_province,
      AdminPostalCode: detail.admin_postal_code,
      AdminCountry: detail.admin_country,
      AdminPhone:
        detail.admin_phone_country_code + "." + detail.admin_phone_number,
      AdminEmailAddress: detail.admin_email_address,

      AuxBillingFirstName: detail.billing_first_name,
      AuxBillingLastName: detail.billing_last_name,
      AuxBillingAddress1: detail.billing_address_1,
      AuxBillingCity: detail.billing_city,
      AuxBillingStateProvince: detail.billing_state_province,
      AuxBillingPostalCode: detail.billing_postal_code,
      AuxBillingCountry: detail.billing_country,
      AuxBillingPhone:
        detail.billing_phone_country_code + "." + detail.billing_phone_number,
      AuxBillingEmailAddress: detail.billing_email_address,
    };

    // literally just making TS happy
    const mapped = Object.entries(apiData).map(([k, v]) => [k, String(v)]);
    const asQueryObject = new URLSearchParams(mapped);
    const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.create&${asQueryObject.toString()}`;
    console.log("[NameCheapDomainService] API URL:", apiUrl);

    // Fetching data from API...
    const data = await fetch(apiUrl, { method: "post" })
      .then((r) => r.text())
      .then(parsePurchaseResponse);
    console.log("[NameCheapDomainService] Purchase response data:", data);

    console.log("TRYING TO CREATE WITH");
    console.log(JSON.stringify({
        workspace_id: Number(workspaceId),
        name: data.Domain,
        user_id: Number(userId),
      }, null, 2));

    // Creating domain in database...
    const createdDomain = await prisma.domain.create({
      data: {
        workspace_id: Number(workspaceId),
        name: data.Domain,
        user_id: Number(userId),
      },
    });
    console.log("[NameCheapDomainService] Created domain:", createdDomain);

    return String(createdDomain.id);
  },
  renewDomain: async function (domainName: string) {
    console.log("Renewing domain:", domainName);
    return;
  },
};
