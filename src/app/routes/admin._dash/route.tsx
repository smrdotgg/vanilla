import { LoaderFunctionArgs } from "@remix-run/node";
import { adminGuard } from "~/app/middlewares/auth.server";
import { AdminDashLayout } from "./components/dash-nav";
import { Outlet } from "@remix-run/react";

export const loader = async (args: LoaderFunctionArgs) => {
  await adminGuard(args);
  return null;
};

const Page = () => {
  return (
    <div className="admin font-mono">
      <AdminDashLayout>
        <Outlet />
      </AdminDashLayout>
    </div>
  );
};

export default Page;
