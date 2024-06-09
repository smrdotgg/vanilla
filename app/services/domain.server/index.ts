/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "~/api";
import SXTJ from "simple-xml-to-json";
import { NameCheapDomainService } from "./NameCheapDomainService";

export interface DomainServiceInterface {
  purchaseDomain({
    domainName,
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
    domainName: string;
  }): Promise<string>;
  renewDomain(domainName: string): Promise<void>;
}

export const nameCheapBaseUrl = `${env.NAMECHEAP_API_URL}xml.response?ApiUser=${env.NAMECHEAP_API_USERNAME}&ApiKey=${env.NAMECHEAP_API_KEY}&UserName=${env.NAMECHEAP_API_USERNAME}&ClientIp=${env.CLIENT_IP}`;

export const DomainService: DomainServiceInterface = NameCheapDomainService;

export const parsePurchaseResponse = async (bodyText: string) => {
  console.log("[parsePurchaseResponse] Initial Data:", bodyText);
  console.log("[parsePurchaseResponse] Parsing purchase response...");

  const responseText = JSON.parse(JSON.stringify(bodyText));
  console.log("[parsePurchaseResponse] Parsed JSON response:", responseText);

  const successJson = SXTJ.convertXML(responseText);
  console.log(
    "[parsePurchaseResponse] Converted XML to JSON:",
    JSON.stringify(successJson, null, 2),
  );

  const errorsObject = (successJson["ApiResponse"]["children"] as any[]).find(
    (o) => Object.hasOwn(o, "Errors"),
  );
  console.log("[parsePurchaseResponse] Errors object:", errorsObject);

  if (Object.keys(errorsObject["Errors"]).length !== 0) {
    console.log("[parsePurchaseResponse] Error occurred:", errorsObject);
    throw Error(
      "Got an error from Namecheap API " + JSON.stringify(errorsObject),
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
    Object.hasOwn(o, "CommandResponse"),
  )["CommandResponse"]["children"][0]["DomainCreateResult"];

  console.log("[parsePurchaseResponse] Parsed data object:", dataObject);

  return dataObject;
};
