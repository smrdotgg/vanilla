import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { DashLayout } from "~/components/custom/side-bar";
import { getCookieSession } from "~/server/auth.server";

export const loader = async (args: LoaderFunctionArgs) => {
  const session = await getCookieSession(args.request);
  if (session === undefined) return redirect("/auth/sign-in");
  return null;
};

export default function Page() {
  return (
    <DashLayout>
      <Outlet />
    </DashLayout>
  );
}
