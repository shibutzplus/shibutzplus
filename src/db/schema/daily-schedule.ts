import { pgTable, text, timestamp, integer, index, date } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const dailySchedule = pgTable('daily_schedule', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  schoolId: text('school_id').notNull(),
  date: date('date').notNull(),
  day: integer('day').notNull(),                 // day of week 1-7
  hour: integer('hour').notNull(),
  columnId: text('column_id'),
  position: integer('position').notNull(),
  columnTypeInt: integer('column_type_int').notNull().default(0),  // 0 - missingTeacher, 1 - existingTeacher, 2 - event
  originalTeacherId: text('original_teacher_id'),
  classIds: text('class_ids').array(),
  subjectId: text('subject_id'),
  subTeacherId: text('sub_teacher_id'),
  instructions: text('instructions'),
  eventTitle: text('event_title'),
  event: text('event'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    schoolIdDateIdx: index('idx_daily_school_date').on(table.schoolId, table.date),
    originalTeacherIdIdx: index('idx_daily_issue_teacher_date_hour').on(table.originalTeacherId, table.date, table.hour),
    subTeacherIdIdx: index('idx_daily_sub_teacher_date_hour').on(table.subTeacherId, table.date, table.hour),
    columnIdIdx: index('idx_daily_school_date_column').on(table.schoolId, table.date, table.columnId),
  };
});

export type DailyScheduleSchema = typeof dailySchedule.$inferSelect;
export type NewDailyScheduleSchema = typeof dailySchedule.$inferInsert;
