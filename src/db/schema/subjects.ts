import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Define the subjects table
export const subjects = pgTable('subjects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  schoolId: text('school_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export the subjects table type
export type SubjectSchema = typeof subjects.$inferSelect;
export type NewSubjectSchema = typeof subjects.$inferInsert;
