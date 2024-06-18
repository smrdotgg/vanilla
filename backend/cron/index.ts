import { schedule } from "node-cron";
import { updateDomainPricesOnDatabase } from "./updateTldTable";
import { prisma } from "~/db/prisma";
import { setupMailboxes } from "backend/routes/mailbox";

export function setupCrons() {
  schedule("0 0 0 1 * *", async () => {
    await updateDomainPricesOnDatabase();
  });

  schedule("0 0 * * * *", async () => {
    const pendingMailboxes = await prisma.mailbox.findMany({
      where: { status: "PENDING" },
    });
    await setupMailboxes({ mailboxIds: pendingMailboxes.map((p) => p.id) });
  });

  // setupMailboxes
  console.log("Crons set up!");
}
