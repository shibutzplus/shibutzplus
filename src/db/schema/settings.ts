import { pgTable, text, integer, boolean, serial } from 'drizzle-orm/pg-core';

export const schoolSettings = pgTable('settings', {
    id: serial('id').primaryKey(),
    hoursNum: integer('hours_num').notNull(),
    displaySchedule2Susb: boolean('display_schedule2susb').default(false).notNull(),
    schoolId: text('school_id').notNull(),
});

export type SchoolSettingsSchema = typeof schoolSettings.$inferSelect;
export type NewSchoolSettingsSchema = typeof schoolSettings.$inferInsert;
