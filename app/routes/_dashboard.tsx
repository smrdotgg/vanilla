import { Outlet } from "@remix-run/react";
import { DashLayout } from "~/components/custom/side-bar";


export default function Page() {
  return (
    <DashLayout>
      <Outlet />
    </DashLayout>
  );
}
