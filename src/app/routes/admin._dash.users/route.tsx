import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { adminGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { UsersTable } from "./components/users_table";
import { sleep } from "~/utils/sleep";
import { INTENTS } from "./types";
import { deleteUser } from "~/utils/firebase/auth.server";
import { DefaultErrorBoundary } from "~/components/custom/my-error-boundary";

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


export const action = async (args: ActionFunctionArgs) => {
  const session = await adminGuard(args);
  const formData = await args.request.formData();
  const intent = String(formData.get("intent"));
  if (intent === INTENTS.deleteUser) {
    const userId = String(formData.get("userId"));
    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    if (!user) return { ok: false, error: "User not found" };

    // await deleteUser({ userId: user.firebase_id });
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { deleted_at: new Date() },
    });

    return { ok: true };
  } else if (intent === INTENTS.restoreUser) {
    const userId = String(formData.get("userId"));
    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    if (!user) return { ok: false, error: "User not found" };

    // await deleteUser({ userId: user.firebase_id });
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { deleted_at: null },
    });

    return { ok: true };
  }
  throw Error("not implemented");
  // const intent = args.request.headers.get("x-intent");
};

export { DefaultErrorBoundary as ErrorBoundary };
