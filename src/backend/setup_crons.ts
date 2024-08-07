import { schedule } from "node-cron";
import { setupMailboxesCron } from "./crons/setup_mailbox";
import { dnsDomainTransferCron } from "./crons/dns_domain_transfer_cron";
import { getReverseDNSTable } from "~/sdks/contabo/bot/get_reverse_ip_table";
import { MailboxCheckCron } from "./crons/mailbox_check";

export const scheduleCrons = async () => {
  schedule("*/10 * * * *", dnsDomainTransferCron);

  schedule("*/10 * * * *", async () => await getReverseDNSTable({}));

  schedule("*/20 * * * *", async () => {
    await MailboxCheckCron();
    await setupMailboxesCron();
    await MailboxCheckCron();
  });
  console.log("Crons setup up!");
};
