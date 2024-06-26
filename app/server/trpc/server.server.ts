import {
  createTRPCProxyClient,
  loggerLink,
  TRPCClientError,
} from "@trpc/client";
import { callProcedure } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { type TRPCErrorResponse } from "@trpc/server/rpc";
// import { headers } from "next/headers";

import { transformer } from "./shared";
import { createTRPCContext } from "../api/trpc";
import { appRouter, AppRouter } from "../api/root";
import { env } from "~/api";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
// const createContext = cache(() => {
//   // const heads = new Headers(headers());
//   // heads.set("x-trpc-source", "rsc");
//
//   return createTRPCContext();
// });

// class MyHeaders {
//   get getData(){
//     const x = [['name','semere'], ['age','22']];
//     const headers = new Headers();
//     headers.append();
//   }
//   constructor(num: number){
//
//   }
// }

export const api = ( req: Request ) =>
  createTRPCProxyClient<AppRouter>({
    transformer,
    links: [
      loggerLink({
        enabled: (op) =>
          env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      /**
       * Custom RSC link that lets us invoke procedures without using http requests. Since Server
       * Components always run on the server, we can just call the procedure as a function.
       */
      () =>
        ({ op }) =>
          observable((observer) => {
            createTRPCContext({ req })
              .then((ctx) => {
                return callProcedure({
                  procedures: appRouter._def.procedures,
                  path: op.path,
                  rawInput: op.input,
                  ctx,
                  type: op.type,
                });
              })
              .then((data) => {
                observer.next({ result: { data } });
                observer.complete();
              })
              .catch((cause: TRPCErrorResponse) => {
                console.log("ERROR");
                observer.error(TRPCClientError.from(cause));
              });
          }),
    ],
  });
