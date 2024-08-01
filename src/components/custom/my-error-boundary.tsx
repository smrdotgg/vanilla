import { useRevalidator } from "@remix-run/react";
import { Button } from "../ui/button";
import { LuLoader2 } from "react-icons/lu";

export function DefaultErrorBoundary() {
  // const error = useRouteError();
  const { revalidate, state } = useRevalidator();
  const isLoading = state === "loading";
  return (
    <div className="text-center  w-full flex *:m-auto">
      <div className="flex flex-col bg-red-300 dark:bg-red-950 p-6 rounded gap-4">
        <p className="select-none">Error occured</p>
        <Button
          onClick={revalidate}
          // variant={"default"}
          disabled={isLoading}
          className="min-w-32 bg-white text-black hover:text-white"
        >
          {isLoading && <LuLoader2 className="animate-spin" />}
          {!isLoading && "Retry"}
        </Button>
      </div>
    </div>
  );
}
