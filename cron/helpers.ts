
export const sequenceStepsToSend = () => {
  // const pastDeadlineCampaigns = await db
  //   .select()
  //   .from(TB_campaigns)
  //   .leftJoin(
  //     TB_sequence_steps,
  //     eq(TB_campaigns.id, TB_sequence_steps.campaignId),
  //   )
  //   .leftJoin(
  //     TB_sequence_breaks,
  //     eq(TB_campaigns.id, TB_sequence_breaks.campaignId),
  //   )
  //   .where(lte(TB_campaigns.deadline, new Date()));
  //
  // const campaignIdToObj = Object.fromEntries(
  //   pastDeadlineCampaigns.map((item) => [item.campaign.id, item.campaign]),
  // );
  // console.log(`past deadline length = ${pastDeadlineCampaigns.length}`);
  //
  // type stepOrBreak =
  //   | (typeof pastDeadlineCampaigns)[number]["sequence_step"]
  //   | (typeof pastDeadlineCampaigns)[number]["sequence_break"];
  //
  // const addedSequenceIds: number[] = [];
  // const addedBreakIds: number[] = [];
  //
  // const campaignIdToChildren: { [k: number]: stepOrBreak[] } =
  //   Object.fromEntries(
  //     pastDeadlineCampaigns.map((item) => [item.campaign.id, []]),
  //   );
  //
  // pastDeadlineCampaigns.map((pastItem) => {
  //   if (pastItem.sequence_step) {
  //     if (!addedSequenceIds.includes(pastItem.sequence_step!.id)) {
  //       addedSequenceIds.push(pastItem.sequence_step!.id);
  //       campaignIdToChildren[pastItem.campaign.id].push(
  //         pastItem.sequence_step!,
  //       );
  //     }
  //   }
  //   if (pastItem.sequence_break) {
  //     if (!addedBreakIds.includes(pastItem.sequence_break!.id)) {
  //       addedBreakIds.push(pastItem.sequence_break!.id);
  //       campaignIdToChildren[pastItem.campaign.id].push(
  //         pastItem.sequence_break!,
  //       );
  //     }
  //   }
  // });
  //
  // const stepsToSend: (typeof pastDeadlineCampaigns)[number]["sequence_step"][] =
  //   [];
  //
  // Object.entries(campaignIdToChildren).map(([k, v]) => {
  //   if (v.length === 0) return;
  //   const children = [...v];
  //   children.sort();
  //
  //   const deadline = campaignIdToObj[Number(k)].deadline!;
  //   const currentDate = new Date();
  //
  //   console.log(
  //     `Starting loop with initial currentDate: ${currentDate} and deadline: ${deadline}`,
  //   );
  //
  //   let index = 0; // Assuming index, deadline, currentDate, children, and stepsToSend are defined elsewhere in your code.
  //
  //   while (deadline <= currentDate && index < children.length) {
  //     console.log(
  //       `Loop iteration: ${index}, currentDate: ${currentDate}, deadline: ${deadline}`,
  //     );
  //
  //     const currentChild = children[index]!;
  //     console.log(
  //       `Inspecting child at index ${index}: ${JSON.stringify(currentChild)}`,
  //     );
  //
  //     if ("state" in currentChild) {
  //       console.log(
  //         `Child at index ${index} has a state: ${currentChild.state}`,
  //       );
  //
  //       if (currentChild.state === "waiting") {
  //         console.log(
  //           `Child at index ${index} is waiting, adding to stepsToSend`,
  //         );
  //         stepsToSend.push(currentChild);
  //       } else {
  //         console.log(
  //           `Child at index ${index} state is not 'waiting', it is '${currentChild.state}'`,
  //         );
  //       }
  //     } else {
  //       console.log(
  //         `Child at index ${index} does not have a 'state', adjusting currentDate`,
  //       );
  //       currentDate.setHours(
  //         currentDate.getHours() + currentChild.lengthInHours,
  //       );
  //       console.log(`New currentDate after adjustment: ${currentDate}`);
  //     }
  //
  //     index += 1;
  //     console.log(
  //       `End of iteration ${index}, currentDate: ${currentDate}, deadline: ${deadline}`,
  //     );
  //   }
  //
  //   console.log(
  //     `Loop completed. Final index: ${index}, stepsToSend length: ${stepsToSend.length}`,
  //   );
  // });
  //
  // const campaignIds = stepsToSend
  //   .map((s) => s?.campaignId)
  //   .filter((item): item is NonNullable<typeof item> => item !== undefined);
  // const analyticSettings = campaignIds.length
  //   ? await db
  //       .select()
  //       .from(TB_analytic_settings)
  //       .where(inArray(TB_analytic_settings.campaignId, campaignIds))
  //   : [];
  //
  // // TS trick to make sure the list items aren't null in TS land
  // return {
  //   campaignIdToChildren,
  //   stepsToSend: stepsToSend
  //     .filter((item): item is NonNullable<typeof item> => item !== null)
  //     .map((i) => ({
  //       ...i,
  //       analyticSettings: analyticSettings.find(
  //         (as) => as.campaignId === i.campaignId,
  //       ),
  //     })),
  // };
};
