import { nameCheapBaseUrl } from ".";
import { NamecheapApiResponse } from "./types";
import SXTJ from "simple-xml-to-json";

export const getDomainData = async ({ name }: { name: string }) => {
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.getinfo&DomainName=${name}`;
  const response = await fetch(apiUrl);
  const responseText = await response.text();
  const successJson = SXTJ.convertXML(
    responseText
  ) as NamecheapApiResponse<DomainDataResponse>;

  if (successJson.ApiResponse.children[0].Errors.children)
    throw Error(
      successJson.ApiResponse.children[0].Errors.children[0].Error.content
    );
  return successJson;
};

type DomainDataResponse = [
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
