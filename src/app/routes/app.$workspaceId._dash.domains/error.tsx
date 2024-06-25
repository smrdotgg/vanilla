import {  useRouteError } from "@remix-run/react";
import { DevErrorComponent } from "~/components/custom/dev-error-comp";
import { env } from "~/utils/env";

export function ErrorBoundary() {
  const error = useRouteError();

  if (env.PUBLIC_ENV === "development")
    return <DevErrorComponent error={error} />;


  // TODO: add proper error component
  return <> Error Happened </>
}
