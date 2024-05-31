import { Outlet, } from "@remix-run/react";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import {
  redirect,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { DashLayout } from "./components/dash-nav";
import { prisma } from "~/db/prisma";
import { COOKIES } from "~/cookies/workspace";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await validateSessionAndRedirectIfInvalid(request).then(
    async (session) => {
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          firebase_id: true,
          workspace_user_join_list: { include: { workspace: true } },
          email: true,
        },
        where: { firebase_id: { equals: session.uid } },
      });
      if (!user) {
        throw Error("User not found");
      }

      const cookieHeader = request.headers.get("Cookie");
      const cookie =
        (await COOKIES.selected_workspace_id.parse(cookieHeader)) || {};
      console.log(`Cookie = ${JSON.stringify(cookie)}`);

      const selectedWorkspaceJoinDataFromCookie =
        user?.workspace_user_join_list.find(
          (wj) => String(wj.workspace_id) === cookie.selected_workspace_id,
        );
      return { user, selectedWorkspaceJoinDataFromCookie };
    },
  );
  if (session === null) {
    throw Error("GOT NULL FOR SOME REASON");
  }
  if (session.user.workspace_user_join_list.length === 0) {
    return redirect("/create_workspace");
  }

  return session;
};

export default function Page() {
  return (
    <DashLayout>
      <Outlet />
    </DashLayout>
  );
}
