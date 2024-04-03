import { db } from "~/db/index.server";
import { lte, eq } from "drizzle-orm";
import {
  SO_campaigns,
  SO_sequence_breaks,
  SO_sequence_steps,
} from "~/db/schema.server";

export const sequenceStepsToSend = async () => {
  const pastDeadlineCampaigns = await db
    .select()
    .from(SO_campaigns)
    .leftJoin(
      SO_sequence_steps,
      eq(SO_campaigns.id, SO_sequence_steps.campaignId),
    )
    .leftJoin(
      SO_sequence_breaks,
      eq(SO_campaigns.id, SO_sequence_breaks.campaignId),
    )
    .where(lte(SO_campaigns.deadline, new Date()));

  const campaignIdToObj = Object.fromEntries(
    pastDeadlineCampaigns.map((item) => [item.campaign.id, item.campaign]),
  );
  console.log(`past deadline length = ${pastDeadlineCampaigns.length}`);

  type stepOrBreak =
    | (typeof pastDeadlineCampaigns)[number]["sequence_step"]
    | (typeof pastDeadlineCampaigns)[number]["sequence_break"];

  const addedSequenceIds: number[] = [];
  const addedBreakIds: number[] = [];

  const campaignIdToChildren: { [k: number]: stepOrBreak[] } =
    Object.fromEntries(
      pastDeadlineCampaigns.map((item) => [item.campaign.id, []]),
    );

  pastDeadlineCampaigns.map((pastItem) => {
    if (pastItem.sequence_step) {
      if (!addedSequenceIds.includes(pastItem.sequence_step!.id)) {
        addedSequenceIds.push(pastItem.sequence_step!.id);
        campaignIdToChildren[pastItem.campaign.id].push(
          pastItem.sequence_step!,
        );
      }
    }
    if (pastItem.sequence_break) {
      if (!addedBreakIds.includes(pastItem.sequence_break!.id)) {
        addedBreakIds.push(pastItem.sequence_break!.id);
        campaignIdToChildren[pastItem.campaign.id].push(
          pastItem.sequence_break!,
        );
      }
    }
  });

  const stepsToSend: (typeof pastDeadlineCampaigns)[number]["sequence_step"][] =
    [];

  Object.entries(campaignIdToChildren).map(([k, v]) => {
    if (v.length === 0) return;
    const children = [...v];
    children.sort();

    const deadline = campaignIdToObj[Number(k)].deadline!;
    const currentDate = new Date();

    console.log(
      `Starting loop with initial currentDate: ${currentDate} and deadline: ${deadline}`,
    );

    let index = 0; // Assuming index, deadline, currentDate, children, and stepsToSend are defined elsewhere in your code.

    while (deadline <= currentDate && index < children.length) {
      console.log(
        `Loop iteration: ${index}, currentDate: ${currentDate}, deadline: ${deadline}`,
      );

      const currentChild = children[index]!;
      console.log(
        `Inspecting child at index ${index}: ${JSON.stringify(currentChild)}`,
      );

      if ("state" in currentChild) {
        console.log(
          `Child at index ${index} has a state: ${currentChild.state}`,
        );

        if (currentChild.state === "waiting") {
          console.log(
            `Child at index ${index} is waiting, adding to stepsToSend`,
          );
          stepsToSend.push(currentChild);
        } else {
          console.log(
            `Child at index ${index} state is not 'waiting', it is '${currentChild.state}'`,
          );
        }
      } else {
        console.log(
          `Child at index ${index} does not have a 'state', adjusting currentDate`,
        );
        currentDate.setHours(
          currentDate.getHours() + currentChild.lengthInHours,
        );
        console.log(`New currentDate after adjustment: ${currentDate}`);
      }

      index += 1;
      console.log(
        `End of iteration ${index}, currentDate: ${currentDate}, deadline: ${deadline}`,
      );
    }

    console.log(
      `Loop completed. Final index: ${index}, stepsToSend length: ${stepsToSend.length}`,
    );
  });

  // TS trick to make sure the list items aren't null in TS land
  return {
    campaignIdToChildren,
    stepsToSend: stepsToSend.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    ),
  };
};
