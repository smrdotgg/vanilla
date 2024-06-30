/* eslint-disable @typescript-eslint/no-explicit-any */
import { nameCheapBaseUrl } from ".";
import SXTJ from "simple-xml-to-json";
import { NamecheapApiResponse } from "./types";
import { topDomains } from "./tlds";

export const checkDomainNameAvailability = async ({
  domains,
}: {
  domains: string[];
}) => {
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.check&DomainList=${domains.join(
    ","
  )}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    const errorMessage = await response.text();
    console.error("Error:", errorMessage);
    throw Error("API request failed");
  }
  const responseParsed = SXTJ.convertXML(
    await response.text()
  ) as NamecheapApiResponse<{ DomainCheckResult: DomainCheckResult }[]>;
  console.log(JSON.stringify(responseParsed, null, 2));
  
  const domainCheckResults =
    responseParsed.ApiResponse.children[3].CommandResponse.children.map(
      (c) => c.DomainCheckResult
    );

  domainCheckResults.sort(
    (first, second) => {
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
    }
  );
  return domainCheckResults;
};

interface DomainCheckResult {
  Domain: string;
  Available: boolean;
  ErrorNo: string;
  Description: string;
  IsPremiumName: boolean;
  PremiumRegistrationPrice: string;
  PremiumRenewalPrice: string;
  PremiumRestorePrice: string;
  PremiumTransferPrice: string;
  IcannFee: string;
  EapFee: string;
}
