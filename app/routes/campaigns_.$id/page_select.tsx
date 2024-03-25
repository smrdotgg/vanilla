import {
  Link,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import {
    TbCircleNumber0,
  TbCircleNumber1,
  TbCircleNumber2,
  TbCircleNumber3,
  TbCircleNumber4,
} from "react-icons/tb";

import { TiTick } from "react-icons/ti";

import { IconType } from "react-icons/lib";
import { CampaignStatus } from "./route";
import { FaChevronRight } from "react-icons/fa";

export function PageSelect({
  basics,
  launch,
  contacts,
  sequence,
  settings,
}: CampaignStatus & { campaignId: number; data: { [k: string]: string } }) {
  const nav = useNavigation();
  const isPending = nav.state != "idle";

  return (
    <div
      className={`flex justify-evenly gap-2  px-6 *:my-auto ${isPending ? "bg-blue-100 bg-opacity-35" : ""}`}
    >
      <PageButton
        href="00_basics"
        label={"Basics"}
        done={basics}
        icon={TbCircleNumber0}
      />
      <FaChevronRight />
      <PageButton
        href="01_contacts"
        label={"Contacts"}
        done={contacts}
        icon={TbCircleNumber1}
      />
      <FaChevronRight />
      <PageButton
        href="02_sequence"
        label={"Sequence"}
        done={sequence}
        icon={TbCircleNumber2}
      />
      {/* <FaChevronRight /> */}
      {/* <PageButton */}
      {/*   href="03_schedule" */}
      {/*   label={"Schedule"} */}
      {/*   done={schedule} */}
      {/*   icon={TbCircleNumber3} */}
      {/* /> */}
      <FaChevronRight />
      <PageButton
        href="04_settings"
        label={"Settings"}
        done={settings}
        icon={TbCircleNumber3}
      />
      <FaChevronRight />
      <PageButton
        href="05_launch"
        label={"Launch"}
        done={launch}
        icon={TbCircleNumber4}
      />
    </div>
  );
}

function PageButton(props: {
  href: string;
  label: string;
  done: boolean;
  icon: IconType;
}) {
  const location = useLocation();
  const selected = location.pathname.includes(props.href);
  return (
    <Link prefetch="intent" to={props.href ?? "#"}>
      <div
        className={`flex w-10 2xl:w-40 ${props.href != undefined ? "cursor-pointer" : "cursor-wait"} justify-center gap-2 rounded py-2 *:my-auto ${selected === true ? "bg-secondary" : ""}`}
      >
        <div
          className={`h-6 w-6 rounded-[.75rem] ${props.done ? "bg-green-500" : "bg-gray-500"}`}
        >
          {props.done ? (
            <TiTick color="white" size={8 * 3} />
          ) : (
            <props.icon color="white" size={8 * 3} />
          )}
        </div>
        <p
          className={`hidden 2xl:inline font-bold ${props.done ? "text-green-500" : "text-gray-500"}`}
        >
          {props.label}
        </p>
      </div>
    </Link>
  );
}
