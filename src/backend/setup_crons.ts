import {schedule} from "node-cron";
import { domainTransferCron } from "./crons/domain_transfer_cron";


export const scheduleCrons = () => {
  schedule('* * * * *', domainTransferCron)
  console.log("Crons setup up!");
}


