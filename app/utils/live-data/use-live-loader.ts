import {
  Path,
  useLoaderData,
  useLocation,
  useResolvedPath,
  useRevalidator,
} from "@remix-run/react";
import { useEffect } from "react";
import { useEventSource } from "remix-utils/sse/react";

export function useLiveLoader<T>({ userId }: { userId?: string } = {}) {
  // let eventName = useLocation().pathname;
  // eventName += eventName.endsWith("/") ? "" : "/";
  // console.log("Listening to event at");
  // const source = `/events${eventName}?${userIdQueryArg(userId)}`;
  // console.log(source);
  // const data = useEventSource(source);
  // console.log("EVENT SOURCE DATA");
  // console.log(data);
  //
  // const { revalidate } = useRevalidator();
  //
  // useEffect(() => {
  //   revalidate();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps -- "we know better" — Moishi
  // }, [data]);

  return useLoaderData<T>();
}

export const userIdQueryArg = (userId?: string) =>
  userId === undefined ? "" : `userId=${userId}`;
