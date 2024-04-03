import { schedule } from "node-cron";
import {addTracking} from "./tracking";
import { db } from "~/db/index.server";
import {
  SO_binding_campaigns_contacts,
  SO_campaign_sender_email_link,
  SO_campaigns,
  SO_contacts,
  SO_sender_emails,
  SO_sequence_steps,
} from "~/db/schema.server";
import { sequenceStepsToSend } from "./helpers";
import { sendWithCustomData } from "./send_email";
import { eq, inArray } from "drizzle-orm";

const main = async () => {
  for (let counter = 0; counter < 40; counter++) process.stdout.write("=");
  console.log("");
  console.log(`${new Date().toISOString()}: cron job triggered`);
  console.log("Starting sequenceStepsToSend function");
  const { stepsToSend } = await sequenceStepsToSend();
  console.log(`Steps to send: ${JSON.stringify(stepsToSend)}`);
  const campaignIds = stepsToSend.map((step) => step.campaignId);

  console.log(`Campaign IDs: ${campaignIds}`);
  console.log("getting DB");
  console.log("Starting database query");

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
  console.log("Database query completed");

  console.log("Processing sender emails and target contacts");
  const senderEmails = [
    ...new Set(
      x
        .map((item) => item.sender_email)
        .filter((item): item is NonNullable<typeof item> => item !== null),
    ),
  ];
  console.log(`Sender Emails: ${JSON.stringify(senderEmails)}`);
  const targetContacts = [
    ...new Set(
      x
        .map((item) => item.contact)
        .filter((item): item is NonNullable<typeof item> => item !== null),
    ),
  ];
  console.log(`Target Contacts: ${JSON.stringify(targetContacts)}`);

  console.log("Starting to send emails");
  await Promise.all(
    stepsToSend.map(async (step) => {
      function getRandomValue<T>(list: T[]): T {
        return list[Math.floor(Math.random() * list.length)];
      }
      const senderEmail = getRandomValue(senderEmails);

      console.log(
        `Processing step: ${JSON.stringify(step)} with sender email: ${JSON.stringify(senderEmail)}`,
      );
      const d = targetContacts.map(async (t) => {
        console.log(`Sending email to: ${t.email}`);
        const args = {
          SMTPPort: senderEmail.smtpPort,
          SMTPHost: senderEmail.smtpHost,
          body: addTracking({targetEmail: t.email,sequenceStepId: step.id.toString(), content: step.content ?? ""}),
          subject: step.title ?? "",
          fromEmail: senderEmail.fromEmail,
          // fromName: senderEmail.fromName,
          password: senderEmail.password,
          username: senderEmail.userName,
          targetAddress: t.email,
        };
        console.log(`args = ${JSON.stringify(args, null, 2)}`);
        return await sendWithCustomData(args);
      });
      await Promise.all(d);
      console.log(`Finished sending emails for step: ${step.id}`);
    }),
  );
  console.log("Emails sent, updating the sequence steps state");

  await db
    .update(SO_sequence_steps)
    .set({ state: "sent" })
    .where(
      inArray(
        SO_sequence_steps.id,
        stepsToSend.map((s) => s.id),
      ),
    );
  console.log("Sequence steps state updated");
};

await main();

// console.log("cron job about to start waiting for an hour...");
// schedule("* * * * *", main);
// console.log("Added console logs throughout the script for better tracking");
