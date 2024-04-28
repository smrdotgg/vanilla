// import type { LoaderFunctionArgs } from "@remix-run/node";
// import { getCookieSession } from "~/server/auth.server";
// import { createEventStream } from "~/utils/live-data/create-event-stream.server";
//
// export async function loader({ request }: LoaderFunctionArgs) {
//   const data = await getCookieSession(request);
//   if (data === undefined) throw Error();
//   return createEventStream(request, `domains`);
// }
