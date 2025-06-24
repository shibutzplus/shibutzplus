import { pgTable, text, varchar, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const annualSchedule = pgTable('annual_schedule', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  day: integer('day').notNull(), // 1-7 representing days of the week
  hour: integer('hour').notNull(), // period within the day
  position: varchar('position', { length: 20 }).notNull(), // concatenation day + '-hour' + hour
  schoolId: text('school_id').notNull(),
  classId: text('class_id').notNull(),
  teacherId: text('teacher_id').notNull(),
  subjectId: text('subject_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    positionIdx: uniqueIndex('annual_position_idx').on(table.schoolId, table.position),
  };
});

export type AnnualScheduleSchema = typeof annualSchedule.$inferSelect;
export type NewAnnualScheduleSchema = typeof annualSchedule.$inferInsert;
