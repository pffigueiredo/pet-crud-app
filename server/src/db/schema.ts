
import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';

export const petsTable = pgTable('pets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  age: integer('age').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Pet = typeof petsTable.$inferSelect; // For SELECT operations
export type NewPet = typeof petsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { pets: petsTable };
