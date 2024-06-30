import { nameCheapBaseUrl } from ".";
import type { NamecheapApiResponse } from "./types";
import SXTJ from "simple-xml-to-json";

export const placeTransferOrder = async ({
  domain,
  eppCode,
}: {
  domain: string;
  eppCode: string;
}) => {
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.transfer.create&Years=1&DomainName=${domain}&EPPCode=${btoa(
    eppCode
  )}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorMessage = await response.text();
    console.error("Error:", errorMessage);
    throw Error("API request failed");
  }
  // console.log(await response.text());
  const responseBody = SXTJ.convertXML(
    await response.text()
  ) as NamecheapApiResponse<TransferResponse>;

  if (responseBody.ApiResponse.children[0].Errors.children)
    throw Error(
      responseBody.ApiResponse.children[0].Errors.children[0].Error.content
    );

  return responseBody.ApiResponse.children[3].CommandResponse.children[0].DomainTransferCreateResult;
};
type TransferResponse = [{
  DomainTransferCreateResult: {
    DomainName: string;
    Transfer: `${boolean}`;
    TransferID: string;
    StatusID: string;
    OrderID: string;
    TransactionID: string;
    ChargedAmount: string;
    StatusCode: string;
  };
}];

// await placeTransferOrder({ domain: "steliade.com", eppCode: "abc" });
