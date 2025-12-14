import { pgTable, text, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { SchoolStatus, SchoolLevel } from '@/models/types/school';

export const schools = pgTable('schools', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull().$type<SchoolLevel>().default('Elementary'),
  status: varchar('status', { length: 20 }).notNull().$type<SchoolStatus>().default('onboarding'),
  hoursNum: integer('hours_num').default(10).notNull(),
  displaySchedule2Susb: boolean('display_schedule2susb').default(false).notNull(),
  publishDates: text('publish_dates').array().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SchoolSchema = typeof schools.$inferSelect;
export type NewSchoolSchema = typeof schools.$inferInsert;
