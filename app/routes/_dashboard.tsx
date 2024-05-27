import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { DashLayout } from "~/components/custom/side-bar";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const session = await validateSessionAndRedirectIfInvalid(request);
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
