import { LoaderFunctionArgs } from "@remix-run/node";
import { adminGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { DataTable } from "./components/table";
import { columns, ComputeData } from "./components/columns";
import { useLoaderData } from "@remix-run/react";

export const loader = async (args: LoaderFunctionArgs) => {
  await adminGuard(args);
  const users = await prisma.user.findMany({
    include: { workspace_user_join_list: { include: { workspace: true } } },
  });

  const computeData = await prisma.vps.findMany();

  const parsedComputeDate: ComputeData[] = computeData.map((data) => {
    return {
      id: data.id.toString(),
      domain: data.domain,
      contaboId: data.compute_id_on_hosting_platform,
      domainPointers: "not_set",
      registrationDate: data.createdAt?.toISOString().split("T")[0] ?? "Unknown",
    };
  });

  return { users, computeData: parsedComputeDate };
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
