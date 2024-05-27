// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { rword } from "rword";
import { sql } from "drizzle-orm";
import {
  index,
  text,
  integer,
  primaryKey,
  unique,
  sqliteTableCreator,
  // pgTableCreator,
  // serial,
  // timestamp,
  // varchar,
  // boolean,

  // pgEnum,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { number } from "zod";
import { db } from "./index.server";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `${name}`);
const drizzleDate = (name: string) => integer(name, { mode: "timestamp_ms" });

// export const TB_oath_ids = pgEnum("oauth_ids", ["google"]);
const TB_oath_ids = text("oauth_ids", { enum: ["google"] });

export const TB_splitboxes = createTable("splitbox", {
  id: text("id").$defaultFn(createId).primaryKey(),
  name: text("name")
    .notNull()
    .$defaultFn(() => {
      const first = rword.generate(1, { contains: ".*ed" });
      const second = rword.generate(1, { contains: ".*ing" });
      const last = rword.generate(1, { contains: "^(?!.*\b(?:ing|ed)\b).+$" });
      return `${first}-${second}-${last}`;
    }),
  computeIdOnHostingPlatform: text("compute_id_on_hosting_platform")
    .unique()
    .notNull(),

  userId: text("user_id")
    .references(() => TB_users.id)
    .notNull(),
});

const randomUUID = () => {
  return crypto.randomUUID();
};

export const TB_contabo_token = createTable("contabo_token", {
  id: text("id").$defaultFn(createId).primaryKey(),
  token: text("token").notNull(),
  expiresAt: drizzleDate("expires_at").notNull(),
  refreshToken: text("refresh_token").notNull(),
  refreshTokenExpiresAt: drizzleDate("refresh_token_expires_at").notNull(),
});

export const TB_users = createTable("user", {
  id: text("id").$defaultFn(createId).primaryKey(),
  email: text("email").unique().notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  oauthProvider: text("oauth_ids", { enum: ["google"] }),
  // oauthProvider: TB_oath_ids("oauth_provider"),
  password: text("password"),
});

export type DomainPurchaseDetailsSelect =
  typeof TB_domainPurchaseDetails.$inferSelect;

export const TB_domainPurchaseDetails = createTable(
  "domain_purchase_form_info",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
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
  id: text("id").$defaultFn(createId).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => TB_users.id),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

export const TB_posts = createTable(
  "post",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    name: text("name").notNull(),

    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

const drizzleDateWithDefault = (name: string) =>
  integer(name, { mode: "timestamp_ms" }).default(
    sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
  );

export const TB_campaigns = createTable("campaign", {
  id: text("id").$defaultFn(createId).primaryKey(),
  name: text("name", { length: 256 }),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => {
      return sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;
    }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => {
      return sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;
    }),
  deadline: drizzleDateWithDefault("deadline"),
  sequence: text("sequence").references(() => TB_users.id),
});

export const TB_google_tokens = createTable("google_tokens", {
  id: text("id").$defaultFn(createId).primaryKey(),
  googleId: text("google_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  expiresIn: drizzleDate("expires_in").notNull(),
  refreshToken: text("refresh_token").notNull(),
  scope: text("scope").notNull(),
  tokenType: text("token_type").notNull(),
  id_token: text("id_token"),
});

export const TB_sender_emails = createTable("sender_email", {
  id: text("id").$defaultFn(createId).primaryKey(),

  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),

  userName: text("user_name").notNull(),
  password: text("password").notNull(),

  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull(),

  imapHost: text("imap_host").notNull(),
  imapPort: integer("imap_port").notNull(),

  createdAt: drizzleDateWithDefault("created_at").notNull(),
  updatedAt: drizzleDateWithDefault("updated_at").notNull(),
});

export const TB_google_user_info = createTable("google_user_info", {
  id: text("id").$defaultFn(createId).primaryKey(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  verifiedEmail: integer("verified_email").notNull(),
  name: text("name").notNull(),
  given_name: text("given_name"),
  family_name: text("family_name"),
  picture: text("picture").notNull(),
  locale: text("locale"),
});

export const TB_google_campaign_bridge = createTable(
  "campaign_google_email_link",
  {
    campaignId: text("campaign_id")
      .references(() => TB_campaigns.id)
      .notNull(),
    googleUserId: text("google_user_id")
      .references(() => TB_google_user_info.id)
      .notNull(),
  },
);

export const TB_campaign_sender_email_link = createTable(
  "campaign_sender_email_link",
  {
    campaignId: text("campaign_id")
      .references(() => TB_campaigns.id)
      .notNull(),
    senderEmailId: text("sender_email_id")
      .references(() => TB_sender_emails.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.campaignId, table.senderEmailId] }),
  }),
);

export const TB_sequence_step_state = text("sequence_step_state", {
  enum: ["sent", "waiting", "bounced"],
});

export const SequenceStepTextFormatTypes = ["html", "plain"] as const;

export const TB_sequence_step_text_format = text("sequence_step_text_format", {
  enum: SequenceStepTextFormatTypes,
});

export const TB_sequence_steps = createTable("sequence_step", {
  id: text("id").$defaultFn(createId).primaryKey(),
  title: text("title"),
  content: text("content"),
  index: integer("index").notNull(),
  createdAt: drizzleDateWithDefault("created_at").notNull(),
  updatedAt: drizzleDate("updated_at").notNull(),
  campaignId: text("campaign_id")
    .references(() => TB_campaigns.id)
    .notNull(),
  state: text("state", {
    enum: ["sent", "waiting", "bounced"],
  })
    .default("waiting")
    .notNull(),
  format: text("format", {
    enum: SequenceStepTextFormatTypes,
  })
    .default("html")
    .notNull(),
});

export const TB_sequence_breaks = createTable("sequence_break", {
  id: text("id").$defaultFn(createId).primaryKey(),
  lengthInHours: integer("length_in_hours").notNull(),
  index: integer("index").notNull(),
  campaignId: text("campaign_id").references(() => TB_campaigns.id),
});

export const TB_analytic_settings = createTable("analytic_settings", {
  id: text("id").$defaultFn(createId).primaryKey(),
  campaignId: text("campaign_id")
    .references(() => TB_campaigns.id)
    .unique(),

  openRate: integer("open_rate", { mode: "boolean" }).default(false),
  replyRate: integer("reply_rate", { mode: "boolean" }).default(false),
  optOutRate: integer("opt_out_rate", { mode: "boolean" }).default(false),
  optOutUrl: text("opt_out_url"),
  bounceRate: integer("bounce_rate", { mode: "boolean" }).default(false),
  clickthroughRate: integer("click_through_rate", { mode: "boolean" }).default(
    false,
  ),
});

export const TB_contacts = createTable("contact", {
  id: text("id").$defaultFn(createId).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  companyName: text("company_name"),
  createdAt: drizzleDateWithDefault("created_at").notNull(),
});

export const TB_binding_campaigns_contacts = createTable(
  "campaigns_contacts",
  {
    campaignId: text("campaign")
      .notNull()
      .references(() => TB_campaigns.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    contactId: text("contact")
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
  id: text("id").$defaultFn(createId).primaryKey(),
  targetEmail: text("target_email").notNull(),
  sequenceStepId: text("sequence_step_id").references(
    () => TB_sequence_steps.id,
  ),
  createdAt: drizzleDateWithDefault("created_at").notNull(),
  name: text("name").notNull(),
  sec: text("sec").notNull(),
});

export const TB_email_open_event = createTable(
  "email_open_event",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    targetEmail: text("target_email").notNull(),
    sequenceStepId: text("sequence_id").references(() => TB_sequence_steps.id),
    createdAt: drizzleDateWithDefault("created_at").notNull(),
  },
  (t) => ({
    unq: unique().on(t.sequenceStepId, t.targetEmail),
  }),
);

export const TB_email_opt_out_event = createTable(
  "email_opt_out_event",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    targetEmail: text("target_email").notNull(),
    createdAt: drizzleDateWithDefault("created_at").notNull(),
    campaignId: text("campaign_id")
      .references(() => TB_campaigns.id)
      .notNull(),
  },
  (table) => ({
    a: unique().on(table.targetEmail, table.campaignId),
  }),
);

export const TB_email_link_click_event = createTable("email_link_click_event", {
  id: text("id").$defaultFn(createId).primaryKey(),
  targetEmail: text("target_email").notNull(),
  sequenceStepId: text("sequence_id").references(() => TB_sequence_steps.id),
  link: text("link").notNull(),
  createdAt: drizzleDateWithDefault("created_at").notNull(),
});

export const TB_domain = createTable("domain", {
  id: text("id").$defaultFn(createId).primaryKey(),
  name: text("name").unique(),
  ownerUser: text("user_id")
    .references(() => TB_users.id)
    .notNull(),
  purchasedAt: drizzleDateWithDefault("purchased_at").notNull(),
  splitboxId: text("splitbox_id").references(() => TB_splitboxes.id),
});
export type DomainSelectType = typeof TB_domain.$inferSelect;

export const TB_cart = createTable("cart", {
  id: text("id").$defaultFn(createId).primaryKey(),
  user: text("user_id")
    .references(() => TB_users.id)
    .notNull()
    .unique(),
});

export const TB_cart_item = createTable(
  "cart_item",
  {
    id: text("id").$defaultFn(createId).primaryKey(),
    cart: text("cart_id")
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
