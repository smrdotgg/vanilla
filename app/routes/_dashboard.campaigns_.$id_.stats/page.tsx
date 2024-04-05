import { FaShield, FaShieldHalved, FaInfo, FaExclamation } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
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
          icon={<RiVerifiedBadgeFill />}
          onClick={() => {}}
          subText={"No issues detected"}
          bottomLeftComponent={<p>bonkers</p>}
          mainText={`${data.deliverability * 100}%`}
          label={"Deliverabilty Rate"}
          // bottomComponentConfig={{
          //   sign: "warning",
          //   mainText: "+2%",
          //   direction: "increasing",
          // }}
        />

        <TextItem
          icon={<FaRegEye />}
          bottomLeftComponent={<p>bonkers</p>}
          mainText={`${data.openRate * 100}%`}
          label={"Open Rate"}
        />
      </div>
    </div>
  );
}
