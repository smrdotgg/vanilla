import { LoaderFunctionArgs } from "@remix-run/node";
import { adminGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { UsersTable } from "./components/users_table";
import { sleep } from "~/utils/sleep";

export const loader = async (args: LoaderFunctionArgs) => {
  await adminGuard(args);
  const users = await prisma.user.findMany({
    include: { workspace_user_join_list: { include: { workspace: true } } },
  });
  return { users };
};

const Page = () => {
  return (
    <div className="flex w-full flex-col p-6 ">
      <p className="text-xl font-bold">User Management</p>
      <UsersTable />
    </div>
  );
};

export default Page;