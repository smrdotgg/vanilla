interface ApiResponse {
    Status: string;
    xmlns: string;
    Errors?: any;
    Warnings?: any;
    RequestedCommand?: string;
    CommandResponse?: CommandResponseData;
    Server?: string;
    GMTTimeDifference?: string;
    ExecutionTime?: string;
}

interface CommandResponseData {
    Type: string;
    DomainCheckResults: DomainCheckResult[];
}

interface DomainCheckResult {
    Domain: string;
    Available: boolean;
    ErrorNo: number;
    Description: string;
    IsPremiumName: boolean;
    PremiumRegistrationPrice: number;
    PremiumRenewalPrice: number;
    PremiumRestorePrice: number;
    PremiumTransferPrice: number;
    IcannFee: number;
    EapFee: number;
}

export function processApiResponse(jsonString: string): ApiResponse {
    const rawResponse = JSON.parse(jsonString);
    const response: ApiResponse = {
        Status: rawResponse.ApiResponse.Status,
        xmlns: rawResponse.ApiResponse.xmlns,
    };

    rawResponse.ApiResponse.children.forEach((child: any) => {
        if ('Errors' in child) {
            response.Errors = child.Errors;
        } else if ('Warnings' in child) {
            response.Warnings = child.Warnings;
        } else if ('RequestedCommand' in child) {
            response.RequestedCommand = child.RequestedCommand.content;
        } else if ('CommandResponse' in child) {
            const crData: CommandResponseData = {
                Type: child.CommandResponse.Type,
                DomainCheckResults: child.CommandResponse.children.map((dc: any) => ({
                    Domain: dc.DomainCheckResult.Domain,
                    Available: dc.DomainCheckResult.Available === "true",
                    ErrorNo: parseInt(dc.DomainCheckResult.ErrorNo),
                    Description: dc.DomainCheckResult.Description,
                    IsPremiumName: dc.DomainCheckResult.IsPremiumName === "true",
                    PremiumRegistrationPrice: parseFloat(dc.DomainCheckResult.PremiumRegistrationPrice),
                    PremiumRenewalPrice: parseFloat(dc.DomainCheckResult.PremiumRenewalPrice),
                    PremiumRestorePrice: parseFloat(dc.DomainCheckResult.PremiumRestorePrice),
                    PremiumTransferPrice: parseFloat(dc.DomainCheckResult.PremiumTransferPrice),
                    IcannFee: parseFloat(dc.DomainCheckResult.IcannFee),
                    EapFee: parseFloat(dc.DomainCheckResult.EapFee)
                }))
            };
            response.CommandResponse = crData;
        } else if ('Server' in child) {
            response.Server = child.Server.content;
        } else if ('GMTTimeDifference' in child) {
            response.GMTTimeDifference = child.GMTTimeDifference.content;
        } else if ('ExecutionTime' in child) {
            response.ExecutionTime = child.ExecutionTime.content;
        }
    });

    return response;
}

