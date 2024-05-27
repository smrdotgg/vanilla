// eslint-disable-next-line react/no-children-prop
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { sendEmail } from "./send.server";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { redirect, useLoaderData } from "@remix-run/react";
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const {uid} = await validateSessionAndRedirectIfInvalid(request);
  return uid;
};

export const action = async () => {
  return null;
};

export default function Index() {
  const x = useLoaderData<typeof loader>();
  return <div>{x}</div>;
}
