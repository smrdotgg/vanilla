
export const prefixPlusDomain = (prefix: string, domain: string) =>
  prefix ? `${prefix}.${domain}` : domain;
