import { eq } from "drizzle-orm";
import { db } from "~/db/index.server";
import { TB_domain, TB_domainPurchaseDetails } from "~/db/schema.server";
import {
  DomainServiceInterface,
  nameCheapBaseUrl,
  parsePurchaseResponse,
} from ".";

// document function below
// https://www.namecheap.com/support/api/methods/domains-dns/set-hosts.aspx
export const NameCheapDomainService: DomainServiceInterface = {
  purchaseDomain: async ({ domainName, userId }) => {
    const details = await db
      .select()
      .from(TB_domainPurchaseDetails)
      .where(eq(TB_domainPurchaseDetails.userId, userId));
    const detail = details[0];
    const apiData: { [key: string]: string | number | null } = {
      DomainName: domainName,
      Years: 1,
      RegistrantFirstName: detail.registrantFirstName,
      RegistrantLastName: detail.registrantLastName,
      RegistrantAddress1: detail.registrantAddress1,
      RegistrantCity: detail.registrantCity,
      RegistrantStateProvince: detail.registrantStateProvince,
      RegistrantPostalCode: detail.registrantPostalCode,
      RegistrantCountry: detail.registrantCountry,
      RegistrantPhone:
        detail.registrantPhoneCountryCode + "." + detail.registrantPhoneNumber,
      RegistrantEmailAddress: detail.registrantEmailAddress,

      TechFirstName: detail.techFirstName,
      TechLastName: detail.techLastName,
      TechAddress1: detail.techAddress1,
      TechCity: detail.techCity,
      TechStateProvince: detail.techStateProvince,
      TechPostalCode: detail.techPostalCode,
      TechCountry: detail.techCountry,
      TechPhone: detail.techPhoneCountryCode + "." + detail.techPhoneNumber,
      TechEmailAddress: detail.techEmailAddress,

      AdminFirstName: detail.adminFirstName,
      AdminLastName: detail.adminLastName,
      AdminAddress1: detail.adminAddress1,
      AdminCity: detail.adminCity,
      AdminStateProvince: detail.adminStateProvince,
      AdminPostalCode: detail.adminPostalCode,
      AdminCountry: detail.adminCountry,
      AdminPhone: detail.adminPhoneCountryCode + "." + detail.adminPhoneNumber,
      AdminEmailAddress: detail.adminEmailAddress,

      AuxBillingFirstName: detail.billingFirstName,
      AuxBillingLastName: detail.billingLastName,
      AuxBillingAddress1: detail.billingAddress1,
      AuxBillingCity: detail.billingCity,
      AuxBillingStateProvince: detail.billingStateProvince,
      AuxBillingPostalCode: detail.billingPostalCode,
      AuxBillingCountry: detail.billingCountry,
      AuxBillingPhone:
        detail.billingPhoneCountryCode + "." + detail.billingPhoneNumber,
      AuxBillingEmailAddress: detail.billingEmailAddress,
    };

    // literally just making TS happy
    const mapped = Object.entries(apiData).map(([k, v]) => [k, String(v)]);

    const asQueryObject = new URLSearchParams(mapped);
    const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.create&${asQueryObject.toString()}`;
    const data = await fetch(apiUrl, { method: "post" })
      .then((r) => r.text())
      .then(parsePurchaseResponse);
    const newDbObj = await db
      .insert(TB_domain)
      .values({ ownerUser: userId, name: data.Domain })
      .returning();
    return newDbObj[0];
  },
  renewDomain: async function (domainName: string) {
    console.log("Renewing domain:", domainName);
    return;
  },
};
