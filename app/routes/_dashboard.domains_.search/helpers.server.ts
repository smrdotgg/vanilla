/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "~/api";
import { topDomains } from "./components/tlds";
import { processApiResponse } from "./gpttype";
import SXTJ from "simple-xml-to-json";
import { prisma } from "~/db/prisma";

const nameCheapBaseUrl = `${env.NAMECHEAP_API_URL}xml.response?ApiUser=${env.NAMECHEAP_API_USERNAME}&ApiKey=${env.NAMECHEAP_API_KEY}&UserName=${env.NAMECHEAP_API_USERNAME}&ClientIp=${env.CLIENT_IP}`;
console.log("NAME CHEAP BASE URL");
console.log(nameCheapBaseUrl);

let cachedResponseText: string | undefined;
let myJson: any;
export const getTldPrice = async (tld: string) => {
  const baseTldData = await prisma.tld_price_info.findUnique({
    where: { name: tld },
  });
  if (!baseTldData) throw Error("TLD Data not found in DB");
  const priceData = await prisma.tld_yearly_price_info.findFirst({
    where: {
      tld_price_id: baseTldData.id,
      year: baseTldData.min_registration_year_count,
    },
  });
  if (!priceData) throw Error("TLD Price Data not found in DB");
  return {
    name: baseTldData.name,
    price: priceData.price,
    time: priceData.year,
  };
};

const obj = {
  ApiResponse: {
    Status: "OK",
    xmlns: "http://api.namecheap.com/xml.response",
    children: [
      {
        Errors: {},
      },
      {
        Warnings: {},
      },
      {
        RequestedCommand: {
          content: "namecheap.users.getpricing",
        },
      },
      {
        CommandResponse: {
          Type: "namecheap.users.getPricing",
          children: [
            {
              UserGetPricingResult: {
                children: [
                  {
                    ProductType: {
                      Name: "domains",
                      children: [
                        {
                          ProductCategory: {
                            Name: "register",
                            children: [
                              {
                                Product: {
                                  Name: "com",
                                  children: [
                                    {
                                      Price: {
                                        Duration: "1",
                                        DurationType: "YEAR",
                                        Price: "10.28",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "10.28",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "2",
                                        DurationType: "YEAR",
                                        Price: "20.56",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "20.56",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "3",
                                        DurationType: "YEAR",
                                        Price: "38.24",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "38.24",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "4",
                                        DurationType: "YEAR",
                                        Price: "52.22",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "52.22",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "5",
                                        DurationType: "YEAR",
                                        Price: "66.20",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "66.20",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "6",
                                        DurationType: "YEAR",
                                        Price: "80.18",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "80.18",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "7",
                                        DurationType: "YEAR",
                                        Price: "94.16",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "94.16",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "8",
                                        DurationType: "YEAR",
                                        Price: "108.14",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "108.14",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "9",
                                        DurationType: "YEAR",
                                        Price: "122.12",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "122.12",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                    {
                                      Price: {
                                        Duration: "10",
                                        DurationType: "YEAR",
                                        Price: "136.10",
                                        PricingType: "ABSOLUTE",
                                        AdditionalCost: "0.18",
                                        RegularPrice: "13.98",
                                        RegularPriceType: "MULTIPLE",
                                        RegularAdditionalCost: "0.18",
                                        RegularAdditionalCostType: "MULTIPLE",
                                        YourPrice: "136.10",
                                        YourPriceType: "ABSOLUTE",
                                        YourAdditonalCost: "0.18",
                                        YourAdditonalCostType: "MULTIPLE",
                                        PromotionPrice: "0.0",
                                        Currency: "USD",
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        Server: {
          content: "PHX01APIEXT03",
        },
      },
      {
        GMTTimeDifference: {
          content: "--4:00",
        },
      },
      {
        ExecutionTime: {
          content: "0.265",
        },
      },
    ],
  },
};

export const getData = async (request: Request) => {
  const queryFormData = new URL(request.url).searchParams.get("query");
  if (queryFormData == null || String(queryFormData).length === 0) {
    return null;
  }
  const domains = queryFormData.includes(".")
    ? [queryFormData]
    : topDomains.map((td) => queryFormData + td);
  return checkDomainAvailability({ domains });
};

export const checkDomainAvailability = async ({
  domains,
}: {
  domains: string[];
}) => {
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.check&DomainList=${domains.join(",")}`;
  console.log(apiUrl);
  const response = await fetch(apiUrl);
  if (!response.ok) {
    const errorMessage = await response.text();
    console.error("Error:", errorMessage);
    throw Error("API request failed");
  } else {
    const responseText = JSON.parse(JSON.stringify(await response.text()));
    const myJson = JSON.stringify(SXTJ.convertXML(responseText));
    const results = processApiResponse(myJson);

    results.CommandResponse?.DomainCheckResults.sort((first, second) => {
      const firstTld = "." + first.Domain.split(".")[1];
      const secondTld = "." + second.Domain.split(".")[1];
      if (!topDomains.includes(firstTld)) {
        return 1;
      }
      if (!topDomains.includes(secondTld)) {
        return 1;
      }

      const firstIndex = topDomains.indexOf(firstTld);
      const secondIndex = topDomains.indexOf(secondTld);

      if (firstIndex > secondIndex) {
        return 1;
      } else if (firstIndex < secondIndex) {
        return -1;
      } else {
        return 0;
      }
    });

    return results;
  }
};

export const getDomainToPriceMap = async (domains: string[] | undefined) => {
  console.log(`getDomainToPriceMap called with domains = ${domains}`);
  const domainToPriceMap: {
    [key: string]: { name: string; price: number; time: number };
  } = {};
  if (domains) {
    for (const domain of domains) {
      console.log(`Processing domain: ${domain}`);
      const tld = domain.split(".")[1];
      console.log(`Extracted TLD: ${tld}`);
      const price = await getTldPrice(tld);
      console.log(`Price for ${tld}: ${price}`);
      if (price !== null) {
        domainToPriceMap[domain] = price;
        console.log(`Added ${domain} to domainToPriceMap`);
      }
    }
  }
  console.log("Domain to price mapping:", domainToPriceMap);
  return domainToPriceMap;
};
