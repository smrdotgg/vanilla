import { schedule } from "node-cron";
import {  setupMailboxesCron } from "./crons/setup_mailbox";

export const scheduleCrons = () => {
  // schedule("*/2 * * * *", dnsDomainTransferCron);

  schedule("*/2 * * * *", setupMailboxesCron);
  console.log("Crons setup up!");
};
