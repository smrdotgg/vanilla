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
//
// export const TB_splitbox_setup_state = pgEnum("splitbox_setup_state", [
//   "pending",
//   "ready",
//   "error"
// ]);


export const TB_splitboxes = createTable("splitbox", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  computeIdOnHostingPlatform: text("compute_id_on_hosting_platform")
    .unique()
    .notNull(),
  userId: text("user_id")
    .references(() => TB_users.id)
    .notNull(),
  // state: TB_splitbox_setup_state("state").notNull().default("pending"),
});

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

export type DomainPurchaseDetailsSelect =
  typeof TB_domainPurchaseDetails.$inferSelect;

export const TB_domainPurchaseDetails = createTable(
  "domain_purchase_form_info",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => TB_users.id),

    registrantFirstName: text("registrant_first_name"),
    registrantLastName: text("registrant_last_name"),
    registrantAddress1: text("registrant_address_1"),
    registrantCity: text("registrant_city"),
    registrantStateProvince: text("registrant_state_province"),
    registrantPostalCode: text("registrant_postal_code"),
    registrantCountry: text("registrant_country"),
    registrantEmailAddress: text("registrant_email_address"),
    registrantPhoneCountryCode: text("registrant_phone_country_code"),
    registrantPhoneNumber: text("registrant_phone_number"),

    techFirstName: text("tech_first_name"),
    techLastName: text("tech_last_name"),
    techAddress1: text("tech_address_1"),
    techCity: text("tech_city"),
    techStateProvince: text("tech_state_province"),
    techPostalCode: text("tech_postal_code"),
    techCountry: text("tech_country"),
    techEmailAddress: text("tech_email_address"),
    techPhoneCountryCode: text("tech_phone_country_code"),
    techPhoneNumber: text("tech_phone_number"),

    adminFirstName: text("admin_first_name"),
    adminLastName: text("admin_last_name"),
    adminAddress1: text("admin_address_1"),
    adminCity: text("admin_city"),
    adminStateProvince: text("admin_state_province"),
    adminPostalCode: text("admin_postal_code"),
    adminCountry: text("admin_country"),
    adminEmailAddress: text("admin_email_address"),
    adminPhoneCountryCode: text("admin_phone_country_code"),
    adminPhoneNumber: text("admin_phone_number"),

    billingFirstName: text("billing_first_name"),
    billingLastName: text("billing_last_name"),
    billingAddress1: text("billing_address_1"),
    billingCity: text("billing_city"),
    billingStateProvince: text("billing_state_province"),
    billingPostalCode: text("billing_postal_code"),
    billingCountry: text("billing_country"),
    billingEmailAddress: text("billing_email_address"),
    billingPhoneCountryCode: text("billing_phone_country_code"),
    billingPhoneNumber: text("billing_phone_number"),
  },
);

// export const TB_;

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

export const TB_email_opt_out_event = createTable(
  "email_opt_out_event",
  {
    id: serial("id").primaryKey(),
    targetEmail: text("target_email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    campaignId: integer("campaign_id")
      .references(() => TB_campaigns.id)
      .notNull(),
  },
  (table) => ({
    a: unique().on(table.targetEmail, table.campaignId),
  }),
);

export const TB_email_link_click_event = createTable("email_link_click_event", {
  id: serial("id").primaryKey(),
  targetEmail: text("target_email").notNull(),
  sequenceStepId: integer("sequence_id").references(() => TB_sequence_steps.id),
  link: text("link").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const TB_domain = createTable("domain", {
  id: serial("id").primaryKey(),
  name: text("name").unique(),
  ownerUser: text("user_id")
    .references(() => TB_users.id)
    .notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});
export type DomainSelectType = typeof TB_domain.$inferSelect;

export const TB_cart = createTable("cart", {
  id: serial("id").primaryKey(),
  user: text("user_id")
    .references(() => TB_users.id)
    .notNull()
    .unique(),
});

export const TB_cart_item = createTable(
  "cart_item",
  {
    id: serial("id").primaryKey(),
    cart: integer("cart_id")
      .references(() => TB_cart.id)
      .notNull(),
    name: text("name"),
  },
  (t) => ({
    unq: unique().on(t.cart, t.name),
  }),
);

/* ---  Type Exports --- */
export type SequenceStep = typeof TB_sequence_steps.$inferSelect;
export type SequenceBreak = typeof TB_sequence_breaks.$inferSelect;
export type SelectContact = typeof TB_contacts.$inferSelect;
export type InsertContact = typeof TB_contacts.$inferInsert;
// purchaseDomain
