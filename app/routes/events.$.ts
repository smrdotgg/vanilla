import { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { emitter } from "~/utils/live-data/emitter.server";
import { userIdQueryArg } from "~/utils/live-data/use-live-loader";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { uid } = await validateSessionAndRedirectIfInvalid( request );
  const path = `/events/${params["*"]}?${userIdQueryArg(uid)}`;
  console.log(`PATH is ${path}`);

  return eventStream(request.signal, (send) => {
    const handler = () => {
      send({ data: String(Date.now()) });
    };
    emitter.addListener(path, handler);
    return () => emitter.removeListener(path, handler);
  });
};
