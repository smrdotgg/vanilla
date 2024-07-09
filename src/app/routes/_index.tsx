import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { redirectUserToWorkspace } from "../route_utils/redirect_to_workspace";
import { getUserData } from "../middlewares/auth.server";
import { prisma } from "~/utils/db";
import { env } from "~/utils/env";

export const loader = async ({request}:LoaderFunctionArgs) => {
  const url = new URL(request.url);
  console.log(`url pathname = ${url.pathname}`);
  if (url.pathname === "/") {
    const { firebaseData, user } = await getUserData({ request });
    if (user) {
      return redirectUserToWorkspace({ request, user });
    } else {
      if (env.NODE_ENV === "development" && firebaseData) {
        const user = await prisma.user.create({
          data: {
            firebase_id: firebaseData.uid,
            email_verified: firebaseData.email_verified ?? false,
            oauth_provider: firebaseData.firebase.sign_in_provider,
          },

          include: {
            workspace_user_join_list: { include: { workspace: true } },
          },
        });
        return redirectUserToWorkspace({ request, user });
      }
      return redirect("/auth/sign-in");
    }
  }
  return null;
};

export default function Page() {
  return <Outlet />;
}
