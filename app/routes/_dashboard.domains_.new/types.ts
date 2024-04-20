
export type CartItem = {
  id: string,
  price: number,
  isAvailable: boolean,
  name: string,
}

export type ApiResponse = {
  ApiResponse: {
    Status: string;
    xmlns: string;
    children: (
      | { Errors: {} }
      | { Warnings: {} }
      | { RequestedCommand: { content: string } }
      | {
          CommandResponse: CommandResponseType;
        }
      | { Server: { content: string } }
      | { GMTTimeDifference: { content: string } }
      | { ExecutionTime: { content: string } }
    )[];
  };
};

export type CommandResponseType = {
            Type: string;
            children: {
              DomainCheckResult: {
                Domain: string;
                Available: "true" | "false";
                ErrorNo: string;
                Description: string;
                IsPremiumName: "true" | "false";
                PremiumRegistrationPrice: string;
                PremiumRenewalPrice: string;
                PremiumRestorePrice: string;
                PremiumTransferPrice: string;
                IcannFee: string;
                EapFee: string;
              };
            }[];
}
