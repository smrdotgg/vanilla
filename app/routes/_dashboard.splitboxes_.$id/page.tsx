import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { MyBreadCrumb } from "../_dashboard.campaigns_.$id_.stats/components/bc";

export const Page = () => {
  return (
    <div>
      <MyBreadCrumb
        data={[
          {
            name: "Domains",
            href: "/splitboxes",
            prefetch: "intent",
          },
          {
            name: "Purchase New",
          },
        ]}
      />
      <div className="flex flex-col gap-2 px-4 *:rounded *:p-2">
        <h1>hey</h1>
      </div>
    </div>
  );
};
