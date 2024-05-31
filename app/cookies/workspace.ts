import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const COOKIES = {
  selected_workspace_id: createCookie("selected_workspace_id", {
    maxAge: 604_800, // one week
  }),
} as const;
