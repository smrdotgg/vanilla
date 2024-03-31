import type { LoaderFunctionArgs } from "@remix-run/node";


export const loader = async (args: LoaderFunctionArgs) => {
  return String(args.request.url);
}
