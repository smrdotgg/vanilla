import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import type { IconType } from "react-icons/lib";
import { Switch } from "~/components/ui/switch";
import type { loader } from "./route";
import { useEffect, useState } from "react";
import { IoMailOpenOutline } from "react-icons/io5";
import { MdOutlineUnsubscribe } from "react-icons/md";
import { HiOutlineCursorArrowRays } from "react-icons/hi2";
import { FaReply } from "react-icons/fa";
import { TbArrowBounce } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { useSetAtom } from "jotai";
import { sequenceCTAAtom } from "../campaigns_.$id/route";
import { api } from "~/server/trpc/react";

export function Page() {
  const { data } = useLoaderData<typeof loader>();
  const [openRate, setOpenRate] = useState(data?.openRate ?? false);
  const [clickThroughRate, setClickThroughRate] = useState(
    data?.clickthroughRate ?? false,
  );
  const [replyRate, setReplyRate] = useState(data?.replyRate ?? false);
  const [optOutRate, setOptOutRate] = useState(data?.optOutRate ?? false);
  const [bounceRate, setBounceRate] = useState(data?.bounceRate ?? false);
  const params = useParams();
  const setCta = useSetAtom(sequenceCTAAtom);
  const updateAnalytics = api.analytics.setAnalytics.useMutation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("use effect ran");
    setCta(
      <Button
        onClick={async (event) => {
          event.stopPropagation();
          event.preventDefault();
          await updateAnalytics.mutateAsync({
            campaignId: Number(params.id),
            clickThroughRate: clickThroughRate,
            unsubRate: optOutRate,
            replyRate: replyRate,
            bounceRate: bounceRate,
            openRate: openRate,
          });
          const target = `/campaigns/${params.id}/05_launch`;
          console.log(`going to target = ${target}`);
          navigate(target);
        }}
        asChild
      >
        <Link to={`/campaigns/${params.id}/05_launch`}>Next</Link>
      </Button>,
    );
    return () => setCta(undefined);
  }, [bounceRate, clickThroughRate, navigate, openRate, optOutRate, params.id, replyRate, setCta, updateAnalytics]);

  return (
    <div className="flex *:mx-auto">
      <div className="rounded bg-gray-100 p-6 dark:bg-gray-900">
        <p className="text-2xl">Analytics Settings</p>
        <div className="pt-6"></div>
        <AnalyticToggle
          onSwitch={() => setOpenRate(!openRate)}
          value={openRate}
          subtext="Track how many recipients open your email."
          text="Open Rate"
          icon={IoMailOpenOutline}
        />
        <AnalyticToggle
          onSwitch={() => setClickThroughRate(!clickThroughRate)}
          value={clickThroughRate}
          subtext="Track how many recipients click on links in your email."
          text="Click-Through Rate"
          icon={HiOutlineCursorArrowRays}
        />
        <AnalyticToggle
          onSwitch={() => setReplyRate(!replyRate)}
          value={replyRate}
          subtext="Track how many of your emails get replies"
          text="Reply Rate"
          icon={FaReply}
        />
        <AnalyticToggle
          onSwitch={() => setOptOutRate(!optOutRate)}
          value={optOutRate}
          subtext="Track how many recipients unsubscribed from your emails."
          text="Unsubscribe Rate"
          icon={MdOutlineUnsubscribe}
        />
        <AnalyticToggle
          onSwitch={() => setBounceRate(!bounceRate)}
          value={bounceRate}
          subtext="Track how many emails bounced and were not delivered."
          text="Bounce Rate"
          icon={TbArrowBounce}
        />
      </div>
    </div>
  );
}

function AnalyticToggle(props: {
  icon: IconType;
  text: string;
  subtext: string;
  value: boolean;
  onSwitch: () => void;
}) {
  const { icon, text, subtext, value, onSwitch } = props;
  return (
    <div className="flex min-w-[calc(8px*100)] justify-between py-2  *:my-auto">
      <div className="flex gap-4 *:my-auto">
        <props.icon className="text-2xl" />

        <div>
          <p className="text-xl">{text}</p>
          <p className="text-gray-700 text-secondary-foreground dark:text-gray-400 ">
            {subtext}
          </p>
        </div>
      </div>
      <div>
        <Switch
          aria-label={text + " Toggle Switch"}
          checked={value}
          onCheckedChange={onSwitch}
        ></Switch>
      </div>
    </div>
  );
}
