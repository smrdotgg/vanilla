/* eslint-disable @typescript-eslint/no-explicit-any */
import SXTJ from "simple-xml-to-json";
import { env } from "~/utils/env";
import { nameCheapBaseUrl } from ".";
import { prisma } from "~/utils/db";

export const purchaseDomain = async ({
  domainName,
  userId,
  workspaceId,
}: {
  domainName: string;
  userId: string;
  workspaceId: string;
}) => {
  const purhcaseDetails = {
    City: env.DOMAIN_PURCHASE_CITY,
    Phone: env.DOMAIN_PURCHASE_PHONE,
    Country: env.DOMAIN_PURCHASE_COUTNRY,
    Address1: env.DOMAIN_PURCHASE_ADDRESS,
    LastName: env.DOMAIN_PURCHASE_LAST_NAME,
    FirstName: env.DOMAIN_PURCHASE_FIRST_NAME,
    PostalCode: env.DOMAIN_PURCHASE_POSTAL_CODE,
    StateProvince: env.DOMAIN_PURCHASE_STATE_PROVICE,
    EmailAddress: env.DOMAIN_PURCHASE_EMAIL_ADDRESS,
  };

  const apiData: { [key: string]: string | number | null } = {
    DomainName: domainName,
    Years: 1,

    RegistrantCity: purhcaseDetails.City,
    RegistrantPhone: purhcaseDetails.Phone,
    RegistrantCountry: purhcaseDetails.Country,
    RegistrantAddress1: purhcaseDetails.Address1,
    RegistrantLastName: purhcaseDetails.LastName,
    RegistrantFirstName: purhcaseDetails.FirstName,
    RegistrantPostalCode: purhcaseDetails.PostalCode,
    RegistrantStateProvince: purhcaseDetails.StateProvince,
    RegistrantEmailAddress: purhcaseDetails.EmailAddress,

    TechCity: purhcaseDetails.City,
    TechPhone: purhcaseDetails.Phone,
    TechCountry: purhcaseDetails.Country,
    TechAddress1: purhcaseDetails.Address1,
    TechLastName: purhcaseDetails.LastName,
    TechFirstName: purhcaseDetails.FirstName,
    TechPostalCode: purhcaseDetails.PostalCode,
    TechStateProvince: purhcaseDetails.StateProvince,
    TechEmailAddress: purhcaseDetails.EmailAddress,

    AuxBillingCity: purhcaseDetails.City,
    AuxBillingPhone: purhcaseDetails.Phone,
    AuxBillingCountry: purhcaseDetails.Country,
    AuxBillingAddress1: purhcaseDetails.Address1,
    AuxBillingLastName: purhcaseDetails.LastName,
    AuxBillingFirstName: purhcaseDetails.FirstName,
    AuxBillingPostalCode: purhcaseDetails.PostalCode,
    AuxBillingStateProvince: purhcaseDetails.StateProvince,
    AuxBillingEmailAddress: purhcaseDetails.EmailAddress,

    AdminCity: purhcaseDetails.City,
    AdminPhone: purhcaseDetails.Phone,
    AdminCountry: purhcaseDetails.Country,
    AdminAddress1: purhcaseDetails.Address1,
    AdminLastName: purhcaseDetails.LastName,
    AdminFirstName: purhcaseDetails.FirstName,
    AdminPostalCode: purhcaseDetails.PostalCode,
    AdminStateProvince: purhcaseDetails.StateProvince,
    AdminEmailAddress: purhcaseDetails.EmailAddress,
  };

  // literally just making TS happy
  const mapped = Object.entries(apiData).map(([k, v]) => [k, String(v)]);
  const asQueryObject = new URLSearchParams(mapped);
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.create&${asQueryObject.toString()}`;

  // Fetching data from API...
  const data = await fetch(apiUrl, { method: "post" })
    .then((r) => r.text())
    .then(parsePurchaseResponse);

  // Creating domain in database...
  const createdDomain = await prisma.domain.create({
    data: {
      workspace_id: Number(workspaceId),
      name: data.Domain,
      user_id: Number(userId),
    },
  });

  return String(createdDomain.id);
};

export const parsePurchaseResponse = async (bodyText: string) => {
  const responseText = JSON.parse(JSON.stringify(bodyText));
  const successJson = SXTJ.convertXML(responseText);

  const errorsObject = (successJson["ApiResponse"]["children"] as any[]).find(
    (o) => Object.hasOwn(o, "Errors")
  );

  if (Object.keys(errorsObject["Errors"]).length !== 0) {
    throw Error(
      "Got an error from Namecheap API " + JSON.stringify(errorsObject)
    );
  }

  const dataObject: {
    Domain: string;
    Registered: `${boolean}`;
    ChargedAmount: `${number}`;
    DomainID: string;
    OrderID: string;
    TransactionID: string;
    WhoisguardEnable: `${boolean}`;
    FreePositiveSSL: `${boolean}`;
    NonRealTimeDomain: `${boolean}`;
  } = (successJson["ApiResponse"]["children"] as any[]).find((o) =>
    Object.hasOwn(o, "CommandResponse")
  )["CommandResponse"]["children"][0]["DomainCreateResult"];

  return dataObject;
};
