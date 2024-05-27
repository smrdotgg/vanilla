import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { loader } from "./route";

export const Page = () => {
  const {splitboxes} = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/splitboxes/new">New Splitbox</Link>
        </Button>
      </div>
      <h1>Splitboxes</h1>
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
