import { schedule } from "node-cron";
import { addTracking } from "./tracking";
import { db } from "~/db/index.server";
import {
  SO_binding_campaigns_contacts,
  SO_campaign_sender_email_link,
  SO_campaigns,
  SO_contacts,
  SO_email_bounce_event,
  SO_sender_emails,
  SO_sequence_steps,
} from "~/db/schema.server";
import { sequenceStepsToSend } from "./helpers";
import { sendWithCustomData } from "./send_email";
import { eq, inArray } from "drizzle-orm";

const shouldLog = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (message?: any, ...optionalParams: any[]) =>
  shouldLog ? console.log(message, optionalParams) : null;

const main = async () => {
  for (let counter = 0; counter < 40; counter++) process.stdout.write("=");
  log("");
  log(`${new Date().toISOString()}: cron job triggered`);
  log("Starting sequenceStepsToSend function");
  const { stepsToSend } = await sequenceStepsToSend();
  log(`Steps to send: ${JSON.stringify(stepsToSend)}`);
  const campaignIds = stepsToSend.map((step) => step.campaignId);

  log(`Campaign IDs: ${campaignIds}`);
  log("getting DB");
  log("Starting database query");

  const x = await db
    .select()
    .from(SO_campaigns)
    .where(inArray(SO_campaigns.id, campaignIds))
    .leftJoin(
      SO_campaign_sender_email_link,
      eq(SO_campaign_sender_email_link.campaignId, SO_campaigns.id),
    )
    .leftJoin(
      SO_sender_emails,
      eq(SO_sender_emails.id, SO_campaign_sender_email_link.senderEmailId),
    )
    .leftJoin(
      SO_binding_campaigns_contacts,
      eq(SO_binding_campaigns_contacts.campaignId, SO_campaigns.id),
    )
    .leftJoin(
      SO_contacts,
      eq(SO_contacts.id, SO_binding_campaigns_contacts.contactId),
    );
  log("Database query completed");

  log("Processing sender emails and target contacts");
  const senderEmails = [
    ...new Set(
      x
        .map((item) => item.sender_email)
        .filter((item): item is NonNullable<typeof item> => item !== null),
    ),
  ];
  log(`Sender Emails: ${JSON.stringify(senderEmails)}`);
  const targetContacts = [
    ...new Set(
      x
        .map((item) => item.contact)
        .filter((item): item is NonNullable<typeof item> => item !== null),
    ),
  ];
  log(`Target Contacts: ${JSON.stringify(targetContacts)}`);

  log("Starting to send emails");
  const masterAwait = (
    await Promise.all(
      stepsToSend.map(async (step) => {
        function getRandomValue<T>(list: T[]): T {
          return list[Math.floor(Math.random() * list.length)];
        }
        const senderEmail = getRandomValue(senderEmails);

        log(
          `Processing step: ${JSON.stringify(step)} with sender email: ${JSON.stringify(senderEmail)}`,
        );
        const d = targetContacts.map(async (t) => {
          log(`Sending email to: ${t.email}`);
          step.analyticSettings;
          const args = {
            SMTPPort: senderEmail.smtpPort,
            SMTPHost: senderEmail.smtpHost,
            body: addTracking({
              targetEmail: t.email,
              sequenceStepId: step.id.toString(),
              content: step.content ?? "",
              customerTrackingLink: step.analyticSettings?.optOutUrl ?? null,
              settings: {
                openRate: Boolean(step.analyticSettings?.openRate),
                optOutRate: Boolean(step.analyticSettings?.optOutRate),
                clickthroughRate: Boolean(
                  step.analyticSettings?.clickthroughRate,
                ),
              },
            }),
            subject: step.title ?? "",
            fromEmail: senderEmail.fromEmail,
            // fromName: senderEmail.fromName,
            password: senderEmail.password,
            username: senderEmail.userName,
            targetAddress: t.email,
          };
          log(`args = ${JSON.stringify(args, null, 2)}`);
          try {
            const response = await sendWithCustomData(args);
            if (response.rejected.length) {
              throw Error();
            }
            return { ...response, stepId: step.id };
          } catch (e) {
            await db
              .insert(SO_email_bounce_event)
              .values({ sequenceStepId: step.id, targetEmail: t.email });
            return null;
          }
        });
        return await Promise.all(d);
      }),
    )
  ).flat();
  log("Emails sent, updating the sequence steps state");

  await db
    .update(SO_sequence_steps)
    .set({ state: "sent" })
    .where(
      inArray(
        SO_sequence_steps.id,
        masterAwait.filter((s) => s?.stepId).map(s => s!.stepId),
      ),
    );
  log("Sequence steps state updated");
};

// await main();

console.log("cron job about to start waiting for an hour...");
schedule("*/10 * * * *", main);
console.log("Added console logs throughout the script for better tracking");
