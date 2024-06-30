import SXTJ from "simple-xml-to-json";
import { nameCheapBaseUrl } from ".";
import { NamecheapApiResponse } from "./types";

export const checkTransferByID = async ({
  transferId,
}: {
  transferId: string;
}) => {
  const apiUrl = `${nameCheapBaseUrl}&Command=namecheap.domains.transfer.getStatus&TransferID=${transferId}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorMessage = await response.text();
    console.error("Error:", errorMessage);
    throw Error("API request failed");
  }
  const responseBody = SXTJ.convertXML(
    await response.text()
  ) as NamecheapApiResponse<TransferResponse>;
  if (responseBody.ApiResponse.children[0].Errors.children)
    throw Error(
      responseBody.ApiResponse.children[0].Errors.children[0].Error.content
    );

  return responseBody.ApiResponse.children[3].CommandResponse.children[0]
    .DomainTransferGetStatusResult;
};

type TransferResponse = [
  {
    DomainTransferGetStatusResult: {
      TransferID: string;
      Status: string;
      StatusID: string;
      StatusDate: string;
      TransferOrderDate: string;
    };
  }
];

// await placeTransferOrder({ domain: "steliade.com", eppCode: "abc" });
