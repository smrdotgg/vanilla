import { Params } from "@remix-run/react";
import { selectedWorkspaceCookie } from "../cookies/workspace";

export const ensureUrlCookieSyncForWorkspaceId = async ({
  request,
  params,
}: {
  request: Request;
  params: Params<string>;
}): Promise<Record<string, never> | { "Set-Cookie": string }> => {
  const urlWkspId = Number(params.workspaceId);
  const cookieWkspId = await selectedWorkspaceCookie.parse(
    request.headers.get("Cookie")
  );
  if (cookieWkspId === urlWkspId) {
    return {};
  } else {
    return {
      "Set-Cookie": await selectedWorkspaceCookie.serialize(urlWkspId),
    };
  }
};
