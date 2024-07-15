import { Outlet } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { DashLayout } from "./components/dash-nav";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { INTENTS } from "./types";
import { redirectUserToWorkspace } from "~/app/route_utils/redirect_to_workspace";
import { z } from "zod";
import { ensureUrlCookieSyncForWorkspaceId } from "~/app/route_utils/workspace_url_cookie_sync";

export const loader = async (args: LoaderFunctionArgs) => {
  const data = await workspaceGuard(args);
  const headers = await ensureUrlCookieSyncForWorkspaceId(args);
  return json(data, { headers });
};

export default function Page() {
  return (
    <DashLayout>
      <Outlet />
    </DashLayout>
  );
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  console.log("Action function called with request and params:");
  const { user } = await workspaceGuard({
    request,
    params,
  });
  console.log("Authenticated user:", user);
  const body = await request.formData();
  console.log("Request body:", body);
  const intent = body.get("intent");
  console.log("Intent:", intent);
  if (intent === INTENTS.changeSelectedWorksapce) {
    console.log("Changing selected workspace...");
    const targetWorkspaceId = z.coerce
      .number()
      .parse(String(body.get("targetWorkspaceId")));
    console.log("Target workspace ID:", targetWorkspaceId);
    return await redirectUserToWorkspace({
      user,
      request,
      workspaceId: targetWorkspaceId,
    });
  } else {
    console.log("Unknown intent:", intent);
  }
  return null;
};













