/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NamecheapApiResponse<T> {
  ApiResponse: {
    Status: string;
    xmlns: string;
    children: [
      {
        Errors: any;
      },
      {
        Warnings: any;
      },
      {
        RequestedCommand: {
          content: string;
        };
      },
      {
        CommandResponse: { Type: string; children: T };
      },
      {
        Server: {
          content: string;
        };
      },
      {
        GMTTimeDifference: {
          content: string;
        };
      },
      {
        ExecutionTime: {
          content: string;
        };
      }
    ];
  };
}
