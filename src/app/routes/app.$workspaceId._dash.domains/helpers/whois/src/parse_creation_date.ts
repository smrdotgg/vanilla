import { SUPPORTED_DOMAINS } from "../index.server";

export const parseWhoisResponse = ({
  tld,
  lines,
}: {
  tld: string;
  lines: string[];
}) => {
  if (SUPPORTED_DOMAINS.includes(tld.toLowerCase())) {
    const creationDateLine = lines.find((line) =>
      line.trim().startsWith("Creation Date:")
    );
    const creationDateString = creationDateLine!
      .split("Creation Date:")[1]
      .trim();
    const creationDate = new Date(creationDateString);

    const domainStatusLines = lines.filter((line) =>
      line.trim().startsWith("Domain Status:")
    );
    const domainStatusValues = domainStatusLines!
      .map((line) => line.split("Domain Status:")[1].trim().split(" "))
      .flat();

    const containsOk = domainStatusValues.includes("ok");
    const containsClientTransferProhibited = domainStatusValues.includes(
      "clientTransferProhibited"
    );
    const containsServerTransferProhibited = domainStatusValues.includes(
      "serverTransferProhibited"
    );
    return {
      creationDate,
      containsOk,
      containsClientTransferProhibited,
      containsServerTransferProhibited,
    };
  }

  throw Error("Unsupported TLD");
};
