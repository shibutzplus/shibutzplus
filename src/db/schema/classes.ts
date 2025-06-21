import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Define the classes table
export const classes = pgTable('classes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  schoolId: text('school_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export the classes table type
export type ClassSchema = typeof classes.$inferSelect;
export type NewClassSchema = typeof classes.$inferInsert;
