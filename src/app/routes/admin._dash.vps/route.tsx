import { LoaderFunctionArgs } from "@remix-run/node";
import { adminGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { DataTable } from "./components/table";
import { columns, ComputeData } from "./components/columns";
import { useLoaderData } from "@remix-run/react";
import { ContaboService } from "~/sdks/contabo";

export const loader = async (args: LoaderFunctionArgs) => {
  await adminGuard(args);
  const users = await prisma.user.findMany({
    include: { workspace_user_join_list: { include: { workspace: true } } },
  });

  const computeData = await prisma.vps.findMany();

  const computeDataWithIp: ComputeData[] = [];

  for (const datum of computeData) {
    const dataFromContabo = await ContaboService.getVPSInstanceData({
      id: datum.compute_id_on_hosting_platform,
    });
    const ipv4 = dataFromContabo.data[0].ipConfig.v4.ip;

    const ipv4PointsTo = (await prisma.reverseDnsEntry.findFirst({where: {from: ipv4}}))?.to;

    computeDataWithIp.push({
      id: datum.id.toString(),
      domain: datum.domain,
      contaboId: datum.compute_id_on_hosting_platform,
      domainPointers: "not_set",
      registrationDate:
        datum.createdAt?.toISOString().split("T")[0] ?? "Unknown",
      ipv4,
      ipv4PointsTo: ipv4PointsTo ?? null,
    });
  }

  return { users, computeData: computeDataWithIp };
};

const Page = () => {
  const { computeData } = useLoaderData<typeof loader>();

  return (
    <div className="flex w-full flex-col p-6 ">
      <p className="text-xl font-bold">Compute Management</p>
      <div className="pt-4"></div>
      <DataTable columns={columns} data={computeData} />
    </div>
  );
};

export default Page;
