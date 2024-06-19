import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/db/prisma";
import { COOKIES } from "~/cookies/workspace";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await validateSessionAndRedirectIfInvalid(request);
  const formData = await request.formData();
  const targetWorkspaceId = String(formData.get("targetWorkspaceId"));
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      firebase_id: true,
      workspace_user_join_list: { include: { workspace: true } },
      email: true,
    },
    where: { firebase_id: { equals: session.uid } },
  });
  const targetWorkspaceInvite = user!.workspace_user_join_list.find(
    (join) => String(join.workspace_id).trim() === targetWorkspaceId.trim(),
  );
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await COOKIES.selected_workspace_id.parse(cookieHeader)) || {};
  if (targetWorkspaceInvite) {
    cookie.selected_workspace_id =
      targetWorkspaceInvite.workspace_id.toString();
  } else if (!cookie.selected_workspace_id) {
    if (user!.workspace_user_join_list.length === 0) {
      return redirect("/create_workspace");
    }
    cookie.selected_workspace_id =
      user!.workspace_user_join_list.at(0)!.workspace_id;
  }
  return new Response(null, {
    headers: {
      "Set-Cookie": await COOKIES.selected_workspace_id.serialize(cookie),
    },
  });
};
