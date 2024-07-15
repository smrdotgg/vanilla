import shellescape from "shell-escape";
import { exec } from "promisify-child-process";
import { parseWhoisResponse } from "./src/parse_creation_date";

const getWhoisInfo = async (domain: string) => {
  const command = shellescape(["whois", domain]);
  const response = await exec(command, { timeout: 10000 });
  return response.stdout!.toString().split("\n");
};

export const SUPPORTED_DOMAINS = ["com", "net", "edu", "club"];
export const checkDomainTransferability = async ({
  domain,
}: {
  domain: string;
}) => {
  if (domain.split(".").length !== 2)
    return {
      isTransferable: false,
      message: "Unrecognizable domain format. Must follow format: example.com",
    };
  const tld = domain.split(".").at(-1)!.toLowerCase();

  if (!SUPPORTED_DOMAINS.includes(tld))
    return {
      isTransferable: false,
      message: `We do not support TLD .${tld}`,
    };

  let lines: string[];
  try {
    lines = await getWhoisInfo(domain);
  } catch (e) {
    return {
      isTransferable: false,
      message: "Server Error",
    };
  }

  const firstLine = lines.find((l) => Boolean(l.trim()))?.toLowerCase();
  const domainIsRegistered =
    firstLine &&
    !firstLine.includes("domain not found") &&
    !firstLine.includes("no match") &&
    !firstLine.includes("no data found") &&
    !firstLine.includes("no match for domain");

  if (!domainIsRegistered) {
    return {
      isTransferable: false,
      message: "Domain has not been registered. Purchase instead.",
    };
  }
  const {
    containsClientTransferProhibited,
    containsServerTransferProhibited,
    containsOk,
    creationDate,
  } = parseWhoisResponse({ lines, tld });

  const daysSinceCreation =
    (new Date().getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
  const isOldEnough = daysSinceCreation > 60;

  const isTransferable =
    containsOk &&
    !containsClientTransferProhibited &&
    !containsServerTransferProhibited;

  if (!isOldEnough) {
    return {
      isTransferable: false,
      message: "Domain needs to be at least 60 days old",
    };
  }
  if (!isTransferable) {
    return { isTransferable: false, message: "Registrar lock is on." };
  }
  return { isTransferable: true, message: null };
};
