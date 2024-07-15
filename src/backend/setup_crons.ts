import { schedule } from "node-cron";
import { setupMailboxesCron } from "./crons/setup_mailbox";
import { dnsDomainTransferCron } from "./crons/dns_domain_transfer_cron";

export const scheduleCrons = async () => {
  schedule("*/10 * * * *", dnsDomainTransferCron);
  schedule("*/10 * * * *", setupMailboxesCron);
  console.log("Crons setup up!");
};
