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

export const SO_sender_emails = createTable("sender_email", {
  id: serial("id").primaryKey(),
  emailAddr: text("email_address").notNull(),
});

export const SO_campaigns = createTable("campaign", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDraft: boolean("isDraft").notNull().default(false),
  sequence: text("sequence"),
});

export const SO_campaign_sender_email_link = createTable(
  "campaign_sender_email_link",
  {
    campaignId: integer("campaign_id")
      .references(() => SO_campaigns.id)
      .notNull(),
    senderEmailId: integer("sender_email_id")
      .references(() => SO_sender_emails.id)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.campaignId, table.senderEmailId] }),
  }),
);

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
});

export const SO_sequence_breaks = createTable("sequence_break", {
  id: serial("id").primaryKey(),
  lengthInHours: integer("length_in_hours").notNull(),
  index: integer("index").notNull(),
  campaignId: integer("campaign_id").references(() => SO_campaigns.id),
});

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
      .references(() => SO_campaigns.id),
    contactId: integer("contact")
      .notNull()
      .references(() => SO_contacts.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.contactId, table.campaignId] }),
  }),
);

/* ---  Type Exports --- */
export type SequenceStep = typeof SO_sequence_steps.$inferSelect;
export type SequenceBreak = typeof SO_sequence_breaks.$inferSelect;
export type SelectContact = typeof SO_contacts.$inferSelect;
export type InsertContact = typeof SO_contacts.$inferInsert;
