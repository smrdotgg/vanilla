export interface Instance {
  tenantId: number;
  customerId: string;
  additionalIps: string[];
  name: string;
  displayName: string;
  instanceId: number;
  dataCenter: string;
  region: string;
  regionName: string;
  productId: string;
  imageId: string;
  ipConfig: {
    v4: {
      ip: string;
      gateway: string;
      netmaskCidr: number;
    };
    v6: {
      ip: string;
      gateway: string;
      netmaskCidr: number;
    };
  };
  macAddress: string;
  ramMb: number;
  cpuCores: number;
  osType: string;
  diskMb: number;
  createdDate: Date;
  cancelDate?: Date;
  status: string;
  vHostId: number;
  vHostNumber: number;
  vHostName: string;
  addOns: string[];
  productType: string;
  productName: string;
  defaultUser: string;
}

export interface Links {
  self: string;
}

