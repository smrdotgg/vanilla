import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { loader } from "./route";

export const Page = () => {
  const x = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/splitboxes/new">New Splitbox</Link>
        </Button>
          <p>
          {JSON.stringify(x)}
          </p>
      </div>
      <h1>Splitboxes</h1>
      <div>
        {/* {splitboxes.map((splitbox) => ( */}
        {/*   <div key={splitbox.id}> */}
        {/*     <Link to={`/splitboxes/${splitbox.id}`}>{splitbox.name}</Link> */}
        {/*   </div> */}
        {/* ))} */}
        <div></div>
      </div>
    </div>
  );
};
