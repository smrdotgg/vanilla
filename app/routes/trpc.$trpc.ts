// import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
// import { createContext } from '~/server/context';
// import { appRouter } from '~/server/router';

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { env } from "~/api";

export const loader = async (args: LoaderFunctionArgs) => {
  return handleRequest(args);
};
export const action = async (args: ActionFunctionArgs) => {
  return handleRequest(args);
};
const createContext = async (req: Request ) => {
  return createTRPCContext({req:req});
};

async function handleRequest(args: LoaderFunctionArgs | ActionFunctionArgs) {
  console.log("TESTING");
    return await fetchRequestHandler({
    endpoint: "/trpc",
    req: args.request,
    router: appRouter,
    createContext: () => createContext(args.request),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });//.then((response) => response);
}
