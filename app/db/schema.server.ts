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
export const createTable = pgTableCreator((name) => `splitbox_${name}`);

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

export const SO_campaigns = createTable(
  "campaign",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isDraft: boolean("isDraft").notNull().default(false),
    sequence: text("sequence"),
  }
);


export const SO_contacts = createTable("contact", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  companyName: varchar("company_name", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectContact = typeof SO_contacts.$inferSelect;
export type InsertContact = typeof SO_contacts.$inferInsert;


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

