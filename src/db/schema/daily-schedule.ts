import { pgTable, text, timestamp, integer, index, date } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { teachers } from './teachers';
import { subjects } from './subjects';

export const dailySchedule = pgTable('daily_schedule', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  schoolId: text('school_id').notNull(),
  date: date('date').notNull(),
  day: integer('day').notNull(),                 // day of week 1-7
  hour: integer('hour').notNull(),
  columnId: text('column_id'),
  position: integer('position').notNull(),
  columnType: integer('column_type').notNull().default(0),  // 0 - missingTeacher, 1 - existingTeacher, 2 - event
  originalTeacherId: text('original_teacher_id').references(() => teachers.id, { onDelete: 'cascade' }),
  classIds: text('class_ids').array(),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
  subTeacherId: text('sub_teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
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
    subjectIdIdx: index('idx_daily_subject_id').on(table.subjectId),
  };
});

export type DailyScheduleSchema = typeof dailySchedule.$inferSelect;
export type NewDailyScheduleSchema = typeof dailySchedule.$inferInsert;
