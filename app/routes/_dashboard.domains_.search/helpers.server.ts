import { env } from "~/api";
import { topDomains } from "./components/tlds";
import { processApiResponse } from "./gpttype";
import SXTJ from "simple-xml-to-json";

const nameCheapBaseUrl = `${env.NAMECHEAP_API_URL}xml.response?ApiUser=semeretereffe&ApiKey=${env.NAMECHEAP_API_KEY}&UserName=${env.NAMECHEAP_API_USERNAME}&ClientIp=${env.CLIENT_IP}`;

let cachedResponseText: string | undefined;
let myJson: any;
export const getTldPrice = async (tld: string) => {
  try {
    const apiUrl = `${env.PUBLIC_URL}namecheap_domain_price_response.xml`;

    if (myJson) {
      const children = myJson["ApiResponse"]["children"];

      const commandResponseIndex = children.findIndex((el: any) =>
        el.hasOwnProperty("CommandResponse"),
      );
      // console.log(JSON.stringify(children, null, 2))
      let data = children[commandResponseIndex]["CommandResponse"];
      data = data["children"][0]["UserGetPricingResult"];
      data = data["children"][0]["ProductType"];
      // console.log('ping 1');
      // console.log(JSON.stringify(data, null, 2));
      data = data["children"];
      // console.log('ping 2');
      // console.log(JSON.stringify(data, null, 2));
      // This means invalid TLD
      if (data === undefined) return null;
      data = data[0]["ProductCategory"];
      // console.log("ping 3");
      // console.log(JSON.stringify(data, null, 2));
      data = data["children"];

      data = data.find(
        (obj: any) =>
          String(obj["Product"]["Name"]).toLowerCase() === tld.toLowerCase(),
      );
      data = data["Product"];
      data = data["children"][0]["Price"];
      const price = Number(data["Price"]);
      return price;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorMessage = await response.text();
      // console.log("Error:", errorMessage);
      return null;
    } else {
      // if (cachedResponse === undefined) cachedResponse = response;

      cachedResponseText = await response.text();
      const responseText = JSON.parse(JSON.stringify(cachedResponseText));
      myJson = JSON.parse(JSON.stringify(SXTJ.convertXML(responseText)));

      const children = myJson["ApiResponse"]["children"];

      const commandResponseIndex = children.findIndex((el: any) =>
        el.hasOwnProperty("CommandResponse"),
      );
      // console.log(JSON.stringify(children, null, 2))
      let data = children[commandResponseIndex]["CommandResponse"];
      data = data["children"][0]["UserGetPricingResult"];
      data = data["children"][0]["ProductType"];
      // console.log('ping 1');
      // console.log(JSON.stringify(data, null, 2));
      data = data["children"];
      // console.log('ping 2');
      // console.log(JSON.stringify(data, null, 2));
      // This means invalid TLD
      if (data === undefined) return null;
      data = data[0]["ProductCategory"];
      // console.log('ping 3');
      // console.log(JSON.stringify(data, null, 2));
      data = data["children"][0]["Product"];
      data = data["children"][0]["Price"];
      const price = Number(data["Price"]);
      return price;
    }
  } catch (e) {
    return null;
  }
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
  return checkDomainAvailability({domains});
};

export const checkDomainAvailability = async ({domains} : {domains: string[]}) => {
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
