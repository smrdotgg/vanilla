import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const COOKIES = {
  selected_workspace_id: createCookie("selected_workspace_id_002", {
    maxAge: 604_800, // one week
  }),
} as const;



export const getUserWorkspaceIdFromCookie = async ({ request }: { request: Request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await COOKIES.selected_workspace_id.parse(cookieHeader))|| {};
  return Number(String(cookie.selected_workspace_id));
};
