/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "~/api";
import { DomainSelectType } from "~/db/schema.server";
import SXTJ from "simple-xml-to-json";
import { NameCheapDomainService } from "./NameCheapDomainService";

export interface DomainServiceInterface {
  purchaseDomain({
    domainName,
    userId,
  }: {
    userId: string;
    domainName: string;
  }): Promise<DomainSelectType>;
  renewDomain(domainName: string): Promise<void>;
}

export const nameCheapBaseUrl = `${env.NAMECHEAP_API_URL}xml.response?ApiUser=${env.NAMECHEAP_API_USERNAME}&ApiKey=${env.NAMECHEAP_API_KEY}&UserName=${env.NAMECHEAP_API_USERNAME}&ClientIp=${env.CLIENT_IP}`;

export const DomainService: DomainServiceInterface = NameCheapDomainService;

export const parsePurchaseResponse = async (bodyText: string) => {
  const responseText = JSON.parse(JSON.stringify(bodyText));

  const successJson = SXTJ.convertXML(responseText);
  const errorsObject = (successJson["ApiResponse"]["children"] as any[]).find(
    (o) => Object.hasOwn(o, "Errors"),
  );
  if (Object.keys(errorsObject["Errors"]).length !== 0) throw Error("Got and error from Namecheap API "+ JSON.stringify(errorsObject));

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
  )["children"][0]["DomainCreateResult"];
  return dataObject;
};
