import { Link } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { timeAgo } from "~/lib/time_ago";

export function CampaignTable({ data }: { data: CampaignTableCellData[] }) {
  return (
    <div className="flex flex-grow flex-col overflow-y-auto">
      {data.map((d, i) => (
        <CampaignRow key={i} campaign={d} />
      ))}
    </div>
  );
}

export type CampaignTableCellData = {
  id: number;
  isDraft: boolean;
  name: string | null;
  contactCount: number;
  updatedAt: string;
};

function CampaignRow({ campaign }: { campaign: CampaignTableCellData }) {
  return (
    <Link prefetch="intent" to={`/campaigns/${campaign.id}`}>
      <div className="flex flex-col px-6 hover:bg-secondary">
        <div className=" flex  justify-between *:my-auto">
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 py-2">
              <div className="flex gap-1">
                <div className="flex">
                  {campaign.name == null ? (
                    <p className="text-gray-500">Not Set</p>
                  ) : (
                    <p className="font-bold">{campaign.name}</p>
                  )}
                  <div className="pl-2"></div>
                  {campaign.isDraft ? (
                    <Badge
                      variant="secondary"
                      className="border border-gray-400"
                    >
                      Draft
                    </Badge>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {campaign.contactCount} contact
                {campaign.contactCount == 1 ? "" : "s"}{" "}
              </p>
              <p className="text-gray-700 dark:text-gray-400">
                Last updated {timeAgo(campaign.updatedAt)}{" "}
              </p>
            </div>
          </div>
          <Button variant={"outline"}>Manage</Button>
        </div>
        <div className="h-[.5px] w-full bg-gray-100 dark:bg-gray-800"></div>
      </div>
    </Link>
  );
}
