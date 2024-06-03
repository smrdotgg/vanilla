import { Button } from "~/components/ui/button";
import {
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Form, Link, useLoaderData } from "@remix-run/react";
import type { loader } from "./route";
import { INTENTS } from "./types";

export function Page() {
  const {selectedWorkspaceId,  domainData } = useLoaderData<typeof loader>();

  if (domainData === undefined) {
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
          <p>Domain not found</p>
        </div>
      </>
    );
  }

  if (!domainData.available) {
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
          <p>Domain not available. Shop for more domains.</p>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-full w-full   *:m-auto justify-center">
    <p>selected = ({selectedWorkspaceId})</p>
      <Card>
        <CardHeader>
          <CardTitle>Complete your purchase</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold">{domainData.name}</span>
            <span className="text-2xl font-bold">
              ${domainData.price.price}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            You&apos;re purchasing a 1 year registration for the domain
            example.com. This will renew automatically each year.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-1">
          <Button asChild variant={"outline"} className="">
            <Link to="/">Cancel</Link>
          </Button>
          <Form method="post">
            <input hidden name="intent" value={INTENTS.purchaseDomain} />
            <input hidden name="domain" value={domainData.name} />
            <Button type="submit" className="w-full">
              Complete Purchase
            </Button>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
}
