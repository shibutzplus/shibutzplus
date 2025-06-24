import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { SchoolStatus, SchoolAgeGroup } from '@/models/types/school';

export const schools = pgTable('schools', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull().$type<SchoolAgeGroup>().default('Elementary'),
  status: varchar('status', { length: 20 }).notNull().$type<SchoolStatus>().default('onboarding'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SchoolSchema = typeof schools.$inferSelect;
export type NewSchoolSchema = typeof schools.$inferInsert;
