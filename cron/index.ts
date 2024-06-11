import { addTracking } from "./tracking";
import { sequenceStepsToSend } from "./helpers";
import { sendWithCustomData } from "./send_email";

const shouldLog = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (message?: any, ...optionalParams: any[]) =>
  shouldLog ? console.log(message, optionalParams) : null;

const main = () => {
  // for (let counter = 0; counter < 40; counter++) process.stdout.write("=");
  // log("");
  // log(`${new Date().toISOString()}: cron job triggered`);
  // log("Starting sequenceStepsToSend function");
  // const { stepsToSend } = await sequenceStepsToSend();
  // log(`Steps to send: ${JSON.stringify(stepsToSend)}`);
  // const campaignIds = stepsToSend.map((step) => step.campaignId);
  //
  // log(`Campaign IDs: ${campaignIds}`);
  // log("getting DB");
  // log("Starting database query");
  //
  // const x = await db
  //   .select()
  //   .from(TB_campaigns)
  //   .where(inArray(TB_campaigns.id, campaignIds))
  //   .leftJoin(
  //     TB_campaign_sender_email_link,
  //     eq(TB_campaign_sender_email_link.campaignId, TB_campaigns.id),
  //   )
  //   .leftJoin(
  //     TB_sender_emails,
  //     eq(TB_sender_emails.id, TB_campaign_sender_email_link.senderEmailId),
  //   )
  //   .leftJoin(
  //     TB_binding_campaigns_contacts,
  //     eq(TB_binding_campaigns_contacts.campaignId, TB_campaigns.id),
  //   )
  //   .leftJoin(
  //     TB_contacts,
  //     eq(TB_contacts.id, TB_binding_campaigns_contacts.contactId),
  //   );
  // log("Database query completed");
  //
  // log("Processing sender emails and target contacts");
  // const senderEmails = [
  //   ...new Set(
  //     x
  //       .map((item) => item.sender_email)
  //       .filter((item): item is NonNullable<typeof item> => item !== null),
  //   ),
  // ];
  // log(`Sender Emails: ${JSON.stringify(senderEmails)}`);
  // const targetContacts = [
  //   ...new Set(
  //     x
  //       .map((item) => item.contact)
  //       .filter((item): item is NonNullable<typeof item> => item !== null),
  //   ),
  // ];
  // log(`Target Contacts: ${JSON.stringify(targetContacts)}`);
  //
  // log("Starting to send emails");
  // const masterAwait = (
  //   await Promise.all(
  //     stepsToSend.map(async (step) => {
  //       function getRandomValue<T>(list: T[]): T {
  //         return list[Math.floor(Math.random() * list.length)];
  //       }
  //       const senderEmail = getRandomValue(senderEmails);
  //
  //       log(
  //         `Processing step: ${JSON.stringify(step)} with sender email: ${JSON.stringify(senderEmail)}`,
  //       );
  //       const d = targetContacts.map(async (t) => {
  //         log(`Sending email to: ${t.email}`);
  //         step.analyticSettings;
  //         const args = {
  //           SMTPPort: senderEmail.smtpPort,
  //           SMTPHost: senderEmail.smtpHost,
  //           body: addTracking({
  //             targetEmail: t.email,
  //             sequenceStepId: step.id.toString(),
  //             content: step.content ?? "",
  //             customerTrackingLink: step.analyticSettings?.optOutUrl ?? null,
  //             settings: {
  //               openRate: Boolean(step.analyticSettings?.openRate),
  //               optOutRate: Boolean(step.analyticSettings?.optOutRate),
  //               clickthroughRate: Boolean(
  //                 step.analyticSettings?.clickthroughRate,
  //               ),
  //             },
  //           }),
  //           subject: step.title ?? "",
  //           fromEmail: senderEmail.fromEmail,
  //           // fromName: senderEmail.fromName,
  //           password: senderEmail.password,
  //           username: senderEmail.userName,
  //           targetAddress: t.email,
  //         };
  //         log(`args = ${JSON.stringify(args, null, 2)}`);
  //         try {
  //           const response = await sendWithCustomData(args);
  //           if (response.rejected.length) {
  //             throw Error();
  //           }
  //           return { ...response, stepId: step.id };
  //         } catch (e) {
  //           await db
  //             .insert(TB_email_bounce_event)
  //             .values({ sequenceStepId: step.id, targetEmail: t.email });
  //           return null;
  //         }
  //       });
  //       return await Promise.all(d);
  //     }),
  //   )
  // ).flat();
  // log("Emails sent, updating the sequence steps state");
  //
  // await db
  //   .update(TB_sequence_steps)
  //   .set({ state: "sent" })
  //   .where(
  //     inArray(
  //       TB_sequence_steps.id,
  //       masterAwait.filter((s) => s?.stepId).map(s => s!.stepId),
  //     ),
  //   );
  // log("Sequence steps state updated");
};

await main();

// console.log("cron job about to start waiting for an hour...");
// schedule("*/10 * * * *", main);
// console.log("Added console logs throughout the script for better tracking");
