import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { loader } from "./route";

export const Page = () => {
  const {splitboxes} = useLoaderData<typeof loader>();

  return (
    <div className=" w-full flex flex-col">

      <div className="flex justify-between p-6 *:my-auto">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Splitboxes</h1>
          <p className="text-gray-500">
            Manage your splitboxes and purchase new ones.
          </p>
        </div>
        <Button asChild>
          <Link to="/splitboxes/new">New Splitbox</Link>
        </Button>
      </div>
      <hr />
      <div className="pt-2"></div>
      <div className="flex flex-col gap-2 px-4 *:rounded *:p-2">
        {splitboxes.map((splitbox) => (
          <div key={splitbox.id} className="dark:bg-gray-800 bg-gray-200">
            <Link to={`/splitboxes/${splitbox.id}`}>{splitbox.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
