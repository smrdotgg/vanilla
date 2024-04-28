import { Button } from "~/components/ui/button";
import {
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Link, useLoaderData } from "@remix-run/react";
import type { loader } from "./route";

export function Page() {
  const { domainData } = useLoaderData<typeof loader>();
  if (domainData === undefined) {
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
          <p>Domain not found</p>
        </div>
      </>
    );
  }

  if (!domainData.available){
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
          <p>Domain not available. Shop for more domains.</p>
        </div>
      </>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Complete your purchase</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">example.com</span>
              <span className="text-2xl font-bold">$9.99</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              You're purchasing a 1 year registration for the domain
              example.com. This will renew automatically each year.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-1">
            <Button asChild variant={"outline"} className="w-full">
              <Link to="/">Cancel</Link>
            </Button>
            <Button onClick={() => {}} className="w-full">
              Complete Purchase
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
