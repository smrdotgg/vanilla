/* eslint-disable @typescript-eslint/no-explicit-any */
import SXTJ from "simple-xml-to-json";
import { prisma } from "~/utils/db";
import { env } from "~/utils/env";
import { checkDomainNameAvailability } from "./check_domain_availability";
import { domainSearch } from "./search";

export const nameCheapBaseUrl = `${env.NAMECHEAP_API_URL}xml.response?ApiUser=${env.NAMECHEAP_API_USERNAME}&ApiKey=${env.NAMECHEAP_API_KEY}&UserName=${env.NAMECHEAP_API_USERNAME}&ClientIp=${env.CLIENT_IP}`;

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

// type UserDetailType = {
//   firstName: string;
//   lastName: string;
//   address1: string;
//   city: string;
//   stateprovince: string;
//   postalcode: string;
//   country: string;
//   phone: string;
//   emailAddress: string;
// };
//
// type PurchaseDetailsType = {
//   user: UserDetailType;
// };

export const NameCheapDomainService = {
  checkDomainNameAvailability,
  domainSearch,
  purchaseDomain: async ({
    domainName,
    userId,
    workspaceId,
  }: // purchaseDetails,
  {
    domainName: string;
    userId: string;
    workspaceId: string;
    // purchaseDetails: PurchaseDetailsType;
  }) => {
    console.log("[NameCheapDomainService] Starting purchaseDomain function...");

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
    }

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
  },
  renewDomain: async function (domainName: string) {
    console.log("Renewing domain:", domainName);
    return;
  },
  getDomainData: async ({ name }: { name: string }) => {
    const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.getinfo&DomainName=${name}`;
    const response = await fetch(apiUrl);
    const responseText = await response.text();
    const successJson = SXTJ.convertXML(responseText) as {
      ApiResponse: GetDomainDataApiResponse;
    };

    if (successJson.ApiResponse.children[0].Errors.children)
      throw Error(
        successJson.ApiResponse.children[0].Errors.children[0].Error.content
      );
    return successJson;
  },
};

interface GetDomainDataApiResponse {
  Status: string;
  xmlns: string;
  children: [
    {
      Errors: any;
    },
    {
      Warnings: any;
    },
    {
      RequestedCommand: {
        content: string;
      };
    },
    {
      CommandResponse: {
        Type: string;
        children: [
          {
            DomainGetInfoResult: {
              Status: string;
              ID: string;
              DomainName: string;
              OwnerName: string;
              IsOwner: string;
              IsPremium: string;
              children: [
                {
                  DomainDetails: {
                    children: [
                      {
                        CreatedDate: {
                          content: string;
                        };
                      },
                      {
                        ExpiredDate: {
                          content: string;
                        };
                      },
                      {
                        NumYears: {
                          content: string;
                        };
                      }
                    ];
                  };
                },
                {
                  LockDetails: object;
                },
                {
                  Whoisguard: {
                    Enabled: string;
                    children: [
                      {
                        ID: {
                          content: string;
                        };
                      }
                    ];
                  };
                },
                {
                  PremiumDnsSubscription: {
                    children: [
                      {
                        UseAutoRenew: {
                          content: string;
                        };
                      },
                      {
                        SubscriptionId: {
                          content: string;
                        };
                      },
                      {
                        CreatedDate: {
                          content: string;
                        };
                      },
                      {
                        ExpirationDate: {
                          content: string;
                        };
                      },
                      {
                        IsActive: {
                          content: string;
                        };
                      }
                    ];
                  };
                },
                {
                  DnsDetails: {
                    ProviderType: string;
                    IsUsingOurDNS: string;
                    HostCount: string;
                    EmailType: string;
                    DynamicDNSStatus: string;
                    IsFailover: string;
                    children: [
                      {
                        Nameserver: {
                          content: string;
                        };
                      },
                      {
                        Nameserver: {
                          content: string;
                        };
                      }
                    ];
                  };
                },
                {
                  Modificationrights: {
                    All: string;
                  };
                }
              ];
            };
          }
        ];
      };
    },
    {
      Server: {
        content: string;
      };
    },
    {
      GMTTimeDifference: {
        content: string;
      };
    },
    {
      ExecutionTime: {
        content: string;
      };
    }
  ];
}
