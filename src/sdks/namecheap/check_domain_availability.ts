/* eslint-disable @typescript-eslint/no-explicit-any */
import { nameCheapBaseUrl } from ".";
import SXTJ from "simple-xml-to-json";
import { ApiResponse, CommandResponseData } from "./types";
import { topDomains } from "./tlds";

export const checkDomainNameAvailability = async ({
  domains,
}: {
  domains: string[];
}) => {
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.check&DomainList=${domains.join(
    ","
  )}`;
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

    // results.CommandResponse?.DomainCheckResults.map((r) => [
    //   r.Domain,
    //   r.Available && !r.IsPremiumName,
    // ]);

    return results;
  }
};

export function processApiResponse(jsonString: string): ApiResponse {
  const rawResponse = JSON.parse(jsonString);
  const response: ApiResponse = {
    Status: rawResponse.ApiResponse.Status,
    xmlns: rawResponse.ApiResponse.xmlns,
  };

  rawResponse.ApiResponse.children.forEach((child: any) => {
    if ("Errors" in child) {
      response.Errors = child.Errors;
    } else if ("Warnings" in child) {
      response.Warnings = child.Warnings;
    } else if ("RequestedCommand" in child) {
      response.RequestedCommand = child.RequestedCommand.content;
    } else if ("CommandResponse" in child) {
      const crData: CommandResponseData = {
        Type: child.CommandResponse.Type,
        DomainCheckResults: child.CommandResponse.children.map((dc: any) => ({
          Domain: dc.DomainCheckResult.Domain,
          Available: dc.DomainCheckResult.Available === "true",
          ErrorNo: parseInt(dc.DomainCheckResult.ErrorNo),
          Description: dc.DomainCheckResult.Description,
          IsPremiumName: dc.DomainCheckResult.IsPremiumName === "true",
          PremiumRegistrationPrice: parseFloat(
            dc.DomainCheckResult.PremiumRegistrationPrice
          ),
          PremiumRenewalPrice: parseFloat(
            dc.DomainCheckResult.PremiumRenewalPrice
          ),
          PremiumRestorePrice: parseFloat(
            dc.DomainCheckResult.PremiumRestorePrice
          ),
          PremiumTransferPrice: parseFloat(
            dc.DomainCheckResult.PremiumTransferPrice
          ),
          IcannFee: parseFloat(dc.DomainCheckResult.IcannFee),
          EapFee: parseFloat(dc.DomainCheckResult.EapFee),
        })),
      };
      response.CommandResponse = crData;
    } else if ("Server" in child) {
      response.Server = child.Server.content;
    } else if ("GMTTimeDifference" in child) {
      response.GMTTimeDifference = child.GMTTimeDifference.content;
    } else if ("ExecutionTime" in child) {
      response.ExecutionTime = child.ExecutionTime.content;
    }
  });

  return response;
}
