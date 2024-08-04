/* eslint-disable @typescript-eslint/no-explicit-any */
import { enableIpv6 } from "./functions/enable_ipv6";
import {
  getOrCreateVPSAndGetId,
  getVPSInstanceData,
} from "./functions/get_or_create_vps";

export const ContaboService = {
  getOrCreateVPSAndGetId,
  getVPSInstanceData,
  enableIpv6,
};

// enableIpv6
