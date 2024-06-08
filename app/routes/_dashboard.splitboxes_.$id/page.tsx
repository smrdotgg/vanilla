import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { MyBreadCrumb } from "../_dashboard.campaigns_.$id_.stats/components/bc";
import { loader } from "./route";

export const Page = () => {
  const { computeObj, contaboData } = useLoaderData<typeof loader>();
  return (
    <div>
    <div className="px-6 py-4">
      <MyBreadCrumb
      
        data={[
          {
            name: "Splitboxes",
            href: "/splitboxes",
            prefetch: "intent",
          },
          {
            name: computeObj.name,
          },
        ]}
      />
    </div>
      <div className="flex flex-col gap-2 px-4 *:rounded *:p-2">
        <h1>computeObj = {JSON.stringify(computeObj, null, 2)}</h1>
        <h1>contaboData = {JSON.stringify(contaboData.ipConfig.v4.ip, null, 2)}</h1>
      </div>
    </div>
  );
};
