/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "~/utils/env";
import { checkDomainNameAvailability } from "./check_domain_availability";
// import { domainSearch } from "./search";
import { placeTransferOrder } from "./place_transfer_order";
import { checkTransferByID } from "./check_transfer_by_id";
import { getDomainData } from "./get_domain_data";
import { purchaseDomain } from "./purchase_domain";

export const nameCheapBaseUrl = `${env.NAMECHEAP_API_URL}xml.response?ApiUser=${env.NAMECHEAP_API_USERNAME}&ApiKey=${env.NAMECHEAP_API_KEY}&UserName=${env.NAMECHEAP_API_USERNAME}&ClientIp=${env.CLIENT_IP}`;

export const NameCheapDomainService = {
  checkTransferByID,
  checkDomainNameAvailability,
  // domainSearch,
  purchaseDomain,
  getDomainData,
  placeTransferOrder,
  renewDomain: async function (domainName: string) {
    console.log("Renewing domain:", domainName);
    return;
  },
};
