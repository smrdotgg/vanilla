import { redirect } from "@remix-run/node";
import { selectedWorkspaceCookie } from "../cookies/workspace";
import { getUserData } from "../middlewares/auth.server";

export const redirectUserToWorkspace = async ({
  request,
  user,
  workspaceId,
}: {
  request: Request;
  user: NonNullable<Awaited<ReturnType<typeof getUserData>>["user"]>;
  workspaceId?: number;
}) => {
  let selectedWorkspaceId =
    workspaceId !== undefined
      ? workspaceId
      : await selectedWorkspaceCookie.parse(request.headers.get("Cookie"));

  const userMembership = user.workspace_user_join_list.find(
    (j) => j.workspace_id === selectedWorkspaceId
  );
  if (selectedWorkspaceId && userMembership) {
    return redirect(`/app/${selectedWorkspaceId}`, {
      headers: {
        "Set-Cookie": await selectedWorkspaceCookie.serialize(
          selectedWorkspaceId
        ),
      },
    });
  } else if (user.workspace_user_join_list.length) {
    selectedWorkspaceId =
      user.workspace_user_join_list[0].workspace_id;
    return redirect(`/app/${selectedWorkspaceId}`, {
      headers: {
        "Set-Cookie": await selectedWorkspaceCookie.serialize(
          selectedWorkspaceId
        ),
      },
    });
  } else {
    return redirect("/create_workspace");
  }
};
