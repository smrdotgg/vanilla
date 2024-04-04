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
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `rs_${name}`);

export const SO_posts = createTable(
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

export const SO_campaigns = createTable("campaign", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deadline: timestamp("deadline"),
  sequence: text("sequence"),
});

export const SO_google_tokens = createTable("google_tokens", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  expiresIn: timestamp("expires_in").notNull(),
  refreshToken: text("refresh_token").notNull(),
  scope: text("scope").notNull(),
  tokenType: text("token_type").notNull(),
  id_token: text("id_token"),
});

export const SO_sender_emails = createTable("sender_email", {
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

export const SO_google_user_info = createTable("google_user_info", {
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

export const SO_google_campaign_bridge = createTable(
  "campaign_google_email_link",
  {
    campaignId: integer("campaign_id")
      .references(() => SO_campaigns.id)
      .notNull(),
    googleUserId: integer("google_user_id")
      .references(() => SO_google_user_info.id)
      .notNull(),
  },
);

export const SO_campaign_sender_email_link = createTable(
  "campaign_sender_email_link",
  {
    campaignId: integer("campaign_id")
      .references(() => SO_campaigns.id)
      .notNull(),
    senderEmailId: integer("sender_email_id")
      .references(() => SO_sender_emails.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.campaignId, table.senderEmailId] }),
  }),
);

export const SO_sequence_step_state = pgEnum("sequence_step_state", [
  "sent",
  "waiting",
]);

export const SequenceStepTextFormatTypes = ["html", "plain"] as const;

export const SO_sequence_step_text_format = pgEnum(
  "sequence_step_text_format",
  SequenceStepTextFormatTypes,
);
// export const OrderMethod = strEnum(orderMethodEnum.enumValues);

export const SO_sequence_steps = createTable("sequence_step", {
  id: serial("id").primaryKey(),
  title: text("title"),
  content: text("content"),
  index: integer("index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  campaignId: integer("campaign_id")
    .references(() => SO_campaigns.id)
    .notNull(),
  state: SO_sequence_step_state("state").default("waiting").notNull(),
  format: SO_sequence_step_text_format("format").default("html").notNull(),
});

export const SO_sequence_breaks = createTable("sequence_break", {
  id: serial("id").primaryKey(),
  lengthInHours: integer("length_in_hours").notNull(),
  index: integer("index").notNull(),
  campaignId: integer("campaign_id").references(() => SO_campaigns.id),
});

export const SO_analytic_settings = createTable("analytic_settings", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id")
    .references(() => SO_campaigns.id)
    .unique(),
  openRate: boolean("open_rate").default(false),
  replyRate: boolean("reply_rate").default(false),
  optOutRate: boolean("opt_out_rate").default(false),
  optOutUrl: text("opt_out_url"),
  bounceRate: boolean("bounce_rate").default(false),
  clickthroughRate: boolean("click_through_rate").default(false),
});

// export const SO_analytic_data = createTable("analytic_data", {
//   id: serial("id").primaryKey(),
//   campaignId: integer("campaign_id").references(() => SO_campaigns.id),
//   openRate: boolean("open_rate").default(false),
//   replyRate: boolean("reply_rate").default(false),
//   optOutRate: boolean("opt_out_rate").default(false),
//   bounceRate: boolean("bounce_rate").default(false),
//   clickthroughRate: boolean("click_through_rate").default(false),
// });

export const SO_contacts = createTable("contact", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  companyName: varchar("company_name", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const SO_binding_campaigns_contacts = createTable(
  "campaigns_contacts",
  {
    campaignId: integer("campaign")
      .notNull()
      .references(() => SO_campaigns.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    contactId: integer("contact")
      .notNull()
      .references(() => SO_contacts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.contactId, table.campaignId] }),
  }),
);

export const SO_email_open_event = createTable("email_open_event", {
  id: serial("id").primaryKey(),
  targetEmail: text("target_email").notNull(),
  sequenceId: integer("sequence_id").references(() => SO_sequence_steps.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const SO_email_opt_out_event = createTable("email_opt_out", {
  id: serial("id").primaryKey(),
  targetEmail: text("target_email").notNull(),
  sequenceId: integer("sequence_id").references(() => SO_sequence_steps.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const SO_email_link_click = createTable("email_link_click", {
  id: serial("id").primaryKey(),
  targetEmail: text("target_email").notNull(),
  sequenceId: integer("sequence_id").references(() => SO_sequence_steps.id),
  link: text("link").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ---  Type Exports --- */
export type SequenceStep = typeof SO_sequence_steps.$inferSelect;
export type SequenceBreak = typeof SO_sequence_breaks.$inferSelect;
export type SelectContact = typeof SO_contacts.$inferSelect;
export type InsertContact = typeof SO_contacts.$inferInsert;
