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
// import { INTENTS } from "./types";

export function Page() {
  const { availability, price, name } = useLoaderData<typeof loader>();

  if (!availability) {
    return (
      <>
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
          <p>
            Domain not available.{" "}
            <Link to="../domains"> Shop for more domains.</Link>
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-full w-full   *:m-auto justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Complete your purchase</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between font-mono">
            <span className="text-xl font-semibold">{name}</span>
            <span className="text-2xl font-bold">${price - 1}.99</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            You&apos;re purchasing a 1 year registration for the domain{" "}
            <span className="font-mono">{name}</span>.<br />
            This will renew automatically each year.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-1">
          <Button asChild variant={"outline"} className="">
            <Link to="/">Cancel</Link>
          </Button>
          <Form method="post">
            <input hidden name="intent" value={INTENTS.purchaseDomain} />
            <input hidden name="domain" value={name} />
            <Button type="submit" className="w-full">
              Complete Purchase
            </Button>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
}
