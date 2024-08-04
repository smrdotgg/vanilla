import { createCookie } from "@remix-run/node";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";

const cookie = createCookie("selected_workspace");

// I recommend you to always add `nullable` to your schema, if a cookie didn't
// come with the request Cookie header Remix will return null, and it can be
// useful to remove it later when clearing the cookie
const workspaceSchema = z.number().nullable();

// pass the cookie and the schema
export const selectedWorkspaceCookie = createTypedCookie({
  cookie,
  schema: workspaceSchema,
});

// export const selectedWorkspaceCookie = createCookie("selected_workspace", );
