/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "~/utils/env";
import { getZone } from "./function/get_zone";
import { DNSimple } from "dnsimple";

export const dnsimple = new DNSimple({
  baseUrl: env.DNSIMPLE_BASE_URL,
  accessToken: env.DNSIMPLE_ACCESS_TOKEN,
});

// export const DNSimpleService = {
//   getZone,
//   createZone,
// };

// enableIpv6
