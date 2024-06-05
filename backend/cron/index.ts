import { schedule } from "node-cron";
import { updateDomainPricesOnDatabase } from "./updateTldTable";

export function setupCrons() {
  schedule("0 0 0 * * *", async () => {
    await updateDomainPricesOnDatabase();
  });
  console.log("Crons set up!");
}
