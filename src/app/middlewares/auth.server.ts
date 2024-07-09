import { redirect } from "@remix-run/node";
import { LOGIN_ROUTE } from "~/utils/constants";
import { prisma } from "~/utils/db";
import { validateSession } from "~/utils/firebase/auth.server";
import { redirectUserToWorkspace } from "../route_utils/redirect_to_workspace";
import { Params } from "@remix-run/react";

export const getUserData = async ({ request }: { request: Request }) => {
  const firebaseData = await validateSession(request);

  const user = firebaseData
    ? await prisma.user.findFirst({
        where: { firebase_id: firebaseData.uid },
        include: { workspace_user_join_list: { include: { workspace: true } } },
      })
    : null;
  return { firebaseData, user };
};

export const adminGuard = async ({ request }: { request: Request }) => {
  try {
    const { firebaseData, user } = await getUserData({ request });

    if (firebaseData === undefined) {
      console.error("Auth Guard: Firebase data is undefined");
      throw Error("Auth Error");
    }
    if (user === null) {
      console.error("Auth Guard: User not found");
      throw Error("User Not Found ");
    }
    
    if (user.role !== "ADMIN") {
      console.error("Auth Guard: User is not an admin");
      throw redirect(LOGIN_ROUTE);
    }

    return {
      user,
      firebaseData,
    };
  } catch (e) {
    console.error("Auth Guard: Authentication failed", e);
    throw redirect(LOGIN_ROUTE);
  }
};
export const workspaceGuard = async ({
  request,
  params,
}: {
  request: Request;
  params: Params<string>;
}) => {
  try {
    const { firebaseData, user } = await getUserData({ request });

    if (firebaseData === undefined) {
      console.error("Auth Guard: Firebase data is undefined");
      throw Error("Auth Error");
    }
    if (user === null) {
      console.error("Auth Guard: User not found");
      throw Error("User Not Found ");
    }

    // workspace check
    const selectedWorkspaceId = Number(params.workspaceId!);

    const workspaceMembership = user.workspace_user_join_list.find(
      (join) => join.workspace_id === selectedWorkspaceId
    );

    if (workspaceMembership === undefined) {
      console.error(
        `Auth Guard: Workspace membership not found for workspace ID ${selectedWorkspaceId}`
      );
      throw await redirectUserToWorkspace({ user, request });
    }

    return {
      user,
      firebaseData,
      workspaceMembership,
    };
  } catch (e) {
    console.error("Auth Guard: Authentication failed", e);
    throw redirect(LOGIN_ROUTE);
  }
};
