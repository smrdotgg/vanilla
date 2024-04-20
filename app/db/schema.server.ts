// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  text,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  timestamp,
  varchar,
  boolean,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { number } from "zod";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `rs_${name}`);

export const TB_oath_ids = pgEnum("oauth_ids", ["google"]);

// export const TB_oauth_users = createTable(
//   "oauth_user",
//   {
//     providerId: TB_oath_ids("provider_id").notNull(),
//     providerUserId: text("provider_user_id").notNull(),
//     userId: text("user_id")
//       .notNull()
//       .references(() => TB_users.id),
//   },
//   (table) => ({
//     unq: primaryKey({ columns: [table.providerId, table.providerUserId] }),
//   }),
// );

export const TB_users = createTable("user", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  oauthProvider: TB_oath_ids("oauth_provider"),
  password: text("password"),
});

// export const TB_user_email_verification_codes = createTable("verification_code", {
//   id: serial("id").primaryKey(),
//   userId: text("user_id").notNull().references(() => TB_users.id),
//   code: text("code").notNull(),
//   expirestAt: timestamp("expires_at", {
//     withTimezone: true,
//     mode: "date",
//   }).notNull()
// });

export const TB_sessions = createTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => TB_users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const TB_posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const TB_campaigns = createTable("campaign", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deadline: timestamp("deadline"),
  sequence: text("sequence"),
});

export const TB_google_tokens = createTable("google_tokens", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  expiresIn: timestamp("expires_in").notNull(),
  refreshToken: text("refresh_token").notNull(),
  scope: text("scope").notNull(),
  tokenType: text("token_type").notNull(),
  id_token: text("id_token"),
});

export const TB_sender_emails = createTable("sender_email", {
  id: serial("id").primaryKey(),

  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),

  userName: text("user_name").notNull(),
  password: text("password").notNull(),

  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull(),

  imapHost: text("imap_host").notNull(),
  imapPort: integer("imap_port").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const TB_google_user_info = createTable("google_user_info", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  verifiedEmail: boolean("verified_email").notNull(),
  name: text("name").notNull(),
  given_name: text("given_name"),
  family_name: text("family_name"),
  picture: text("picture").notNull(),
  locale: text("locale"),
});

export const TB_google_campaign_bridge = createTable(
  "campaign_google_email_link",
  {
    campaignId: integer("campaign_id")
      .references(() => TB_campaigns.id)
      .notNull(),
    googleUserId: integer("google_user_id")
      .references(() => TB_google_user_info.id)
      .notNull(),
  },
);

export const TB_campaign_sender_email_link = createTable(
  "campaign_sender_email_link",
  {
    campaignId: integer("campaign_id")
      .references(() => TB_campaigns.id)
      .notNull(),
    senderEmailId: integer("sender_email_id")
      .references(() => TB_sender_emails.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.campaignId, table.senderEmailId] }),
  }),
);

export const TB_sequence_step_state = pgEnum("sequence_step_state", [
  "sent",
  "waiting",
  "bounced",
]);

export const SequenceStepTextFormatTypes = ["html", "plain"] as const;

export const TB_sequence_step_text_format = pgEnum(
  "sequence_step_text_format",
  SequenceStepTextFormatTypes,
);
// export const OrderMethod = strEnum(orderMethodEnum.enumValues);

export const TB_sequence_steps = createTable("sequence_step", {
  id: serial("id").primaryKey(),
  title: text("title"),
  content: text("content"),
  index: integer("index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  campaignId: integer("campaign_id")
    .references(() => TB_campaigns.id)
    .notNull(),
  state: TB_sequence_step_state("state").default("waiting").notNull(),
  format: TB_sequence_step_text_format("format").default("html").notNull(),
});

export const TB_sequence_breaks = createTable("sequence_break", {
  id: serial("id").primaryKey(),
  lengthInHours: integer("length_in_hours").notNull(),
  index: integer("index").notNull(),
  campaignId: integer("campaign_id").references(() => TB_campaigns.id),
});

export const TB_analytic_settings = createTable("analytic_settings", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id")
    .references(() => TB_campaigns.id)
    .unique(),
  openRate: boolean("open_rate").default(false),
  replyRate: boolean("reply_rate").default(false),
  optOutRate: boolean("opt_out_rate").default(false),
  optOutUrl: text("opt_out_url"),
  bounceRate: boolean("bounce_rate").default(false),
  clickthroughRate: boolean("click_through_rate").default(false),
});

export const TB_contacts = createTable("contact", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  companyName: varchar("company_name", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const TB_binding_campaigns_contacts = createTable(
  "campaigns_contacts",
  {
    campaignId: integer("campaign")
      .notNull()
      .references(() => TB_campaigns.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    contactId: integer("contact")
      .notNull()
      .references(() => TB_contacts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.contactId, table.campaignId] }),
  }),
);

export const TB_email_bounce_event = createTable("email_bounce_event", {
  id: serial("id").primaryKey(),
  targetEmail: text("target_email").notNull(),
  sequenceStepId: integer("sequence_step_id").references(
    () => TB_sequence_steps.id,
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const TB_email_open_event = createTable(
  "email_open_event",
  {
    id: serial("id").primaryKey(),
    targetEmail: text("target_email").notNull(),
    sequenceStepId: integer("sequence_id").references(
      () => TB_sequence_steps.id,
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    unq: unique().on(t.sequenceStepId, t.targetEmail),
  }),
);

export const TB_email_opt_out_event = createTable("email_opt_out_event", {
  id: serial("id").primaryKey(),
  targetEmail: text("target_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  campaignId: integer("campaign_id").references(() => TB_campaigns.id).notNull(),
}, (table) => ({
  a: unique().on(table.targetEmail, table.campaignId),
}));


export const TB_email_link_click_event = createTable("email_link_click_event", {
  id: serial("id").primaryKey(),
  targetEmail: text("target_email").notNull(),
  sequenceStepId: integer("sequence_id").references(() => TB_sequence_steps.id),
  link: text("link").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ---  Type Exports --- */
export type SequenceStep = typeof TB_sequence_steps.$inferSelect;
export type SequenceBreak = typeof TB_sequence_breaks.$inferSelect;
export type SelectContact = typeof TB_contacts.$inferSelect;
export type InsertContact = typeof TB_contacts.$inferInsert;
