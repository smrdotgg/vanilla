import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { loader } from "./route";

export const Page = () => {
  const data = useLoaderData<typeof loader>();
  const [name, setName] = useState(data ?? "");
  return (
    <div className="flex h-full *:m-auto">
      <div className="flex flex-col gap-4   ">
        <h1 className="text-4xl">
          Setup a name for this email campaign to help you identify it.
        </h1>
        <div className="bg-red-200 "></div>
        <Form method="post" className="flex flex-col gap-2">
          <Input
            value={name}
            name="campaign_name"
            onChange={(e) => setName(e.target.value)}
            className="h-32 w-full border border-primary px-4 text-7xl font-semibold "
            placeholder="Campaign Name"
          />
          <Button
            type="submit"
            className={`${name.length ? "opacity-100" : "opacity-0"}  h-20 w-full text-5xl font-bold transition-opacity`}
          >
            Next
          </Button>
        </Form>
      </div>
    </div>
  );
};
