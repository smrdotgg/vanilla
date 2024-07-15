import { NameCheapDomainService } from "~/sdks/namecheap";
import { prisma } from "~/utils/db";

export const domainTransferCron = async () => {
  console.log("domainTransferCron started");
  const transfersToBeHandled = await prisma.domain_transfer.findMany({
    where: { namecheap_transfer: { none: { success: true } } },
    include: {
      namecheap_transfer: true,
      // namecheap_transfer: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });
  console.log(`Found ${transfersToBeHandled.length} transfers to be handled`);

  for (const transferDatabaseObject of transfersToBeHandled) {
    console.log(
      `Processing transferDatabaseObject for ${transferDatabaseObject.name}`
    );
    for (const namecheapTransfer of transferDatabaseObject.namecheap_transfer) {
      console.log(
        `Processing namecheapTransfer with id (${namecheapTransfer.namecheapId})`
      );
      const namecheapData = await NameCheapDomainService.checkTransferByID({
        transferId: namecheapTransfer.namecheapId,
      });

      console.log(`Namecheap Status: ${namecheapData.Status}`);
      console.log(`Namecheap StatusId: ${namecheapData.StatusID}`);

      await prisma.domain_transfer.updateMany({
        where: { namecheap_transfer: { some: { id: namecheapTransfer.id } } },
        data: { note: namecheapData.Status },
      });
    }
  }
  console.log("domainTransferCron finished");
};
