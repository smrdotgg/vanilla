import {  useRouteLoaderData } from "@remix-run/react";
import { loader } from "~/root";


export const useUserId = () => {
  const x = useRouteLoaderData<typeof loader>("root");
  return x?.userId;
}