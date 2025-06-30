import { pgTable, text, varchar, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const dailySchedule = pgTable('daily_schedule', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  date: text('date').notNull(), // need to be in format YYYY-MM-DD
  hour: integer('hour').notNull(), // period number
  eventTitle: varchar('event_title', { length: 255 }),
  event: text('event'),
  schoolId: text('school_id').notNull(),
  classId: text('class_id').notNull(),
  subjectId: text('subject_id'),
  absentTeacherId: text('absent_teacher_id'),
  presentTeacherId: text('present_teacher_id'),
  subTeacherId: text('sub_teacher_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    dateHourIdx: uniqueIndex('daily_date_hour_idx').on(table.schoolId, table.date, table.hour, table.classId),
  };
});

export type DailyScheduleSchema = typeof dailySchedule.$inferSelect;
export type NewDailyScheduleSchema = typeof dailySchedule.$inferInsert;
