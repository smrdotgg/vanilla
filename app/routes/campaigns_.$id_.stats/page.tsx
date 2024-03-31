import { FaShield, FaShieldHalved, FaInfo, FaExclamation } from "react-icons/fa6";
import { TextItem } from "./components/text_item";
import { MyBreadCrumb } from "./components/bc";
import { useLoaderData } from "@remix-run/react";
import {loader} from "./route";

export function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 p-4">
    <MyBreadCrumb data={[
      {
        name: "Campaigns",
        href: "/campaigns",
      },
      {name: data.campaign.name}
    ]} />
      <div className="flex gap-2">

        <TextItem
          icon={<FaShieldHalved />}
          onClick={() => {}}
          subText={"No issues detected"}
          bottomLeftComponent={<p>bonkers</p>}
          mainText={"Good"}
          label={"Reputation"}
          bottomComponentConfig={{
            sign: "warning",
            mainText: "+2%",
            direction: "increasing",
          }}
        />

        <TextItem
          icon={<FaShieldHalved />}
          subText={"No issues detected"}
          bottomLeftComponent={<p>bonkers</p>}
          mainText={"Good"}
          label={"Reputation"}
          bottomComponentConfig={{
            sign: "warning",
            mainText: "+2%",
            direction: "increasing",
          }}
        />
      </div>
    </div>
  );
}
