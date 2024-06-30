import { NameCheapDomainService } from "~/sdks/namecheap";
import { prisma } from "~/utils/db";

export const domainTransferCron = async () => {
  console.log("domainTransferCron started");
  const transfersToBeHandled = await prisma.domain_transfer.findMany({
    where: { status: "QUEUED" },
  });
  console.log(`Found ${transfersToBeHandled.length} transfers to be handled`);

  const errorCodes = ["-4", "-22", "-202"];
  const waitCodes = ["-1", "-5", "-2"];

  for (const transfer of transfersToBeHandled) {
    console.log(`Processing transfer with ID ${transfer.transfer_id}`);
    const namecheapData = await NameCheapDomainService.checkTransferByID({
      transferId: transfer.transfer_id,
    });

    let newStatus = transfer.status;
    if (errorCodes.includes(namecheapData.StatusID)) {
      newStatus = "ERROR";
    } else if (waitCodes.includes(namecheapData.StatusID)) {
      newStatus = "QUEUED";
    } else {
      newStatus = "UNKNOWN";
    }

    console.log(`Namecheap Status: ${namecheapData.Status}`);
    console.log(`Namecheap StatusId: ${namecheapData.StatusID}`);

    await prisma.domain_transfer.update({
      where: { transfer_id: transfer.transfer_id },
      data: { note: namecheapData.Status, status: newStatus },
    });
  }
  console.log("domainTransferCron finished");
};
