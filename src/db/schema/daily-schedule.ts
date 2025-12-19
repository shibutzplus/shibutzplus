import { pgTable, text, varchar, timestamp, integer, index, date } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { ColumnType } from '@/models/types/dailySchedule';

export const dailySchedule = pgTable('daily_schedule', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  date: date('date').notNull(),
  day: varchar('day', { length: 10 }).notNull(), // day of week 1-7 (should have been integer)
  hour: integer('hour').notNull(),
  eventTitle: varchar('event_title', { length: 255 }),
  event: text('event'),
  columnId: text('column_id'),
  schoolId: text('school_id').notNull(),
  classId: text('class_id'),
  classIds: text('class_ids').array(),
  subjectId: text('subject_id'),
  subTeacherId: text('sub_teacher_id'),
  issueTeacherId: text('issue_teacher_id'),
  issueTeacherType: varchar('issue_teacher_type', { length: 20 }).notNull().$type<ColumnType>().default('missingTeacher'),
  instructions: text('instructions'),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    schoolIdDateIdx: index('idx_daily_school_date').on(table.schoolId, table.date),
    issueTeacherIdIdx: index('idx_daily_issue_teacher_id').on(table.issueTeacherId),
    subTeacherIdIdx: index('idx_daily_sub_teacher_id').on(table.subTeacherId),
    classIdIdx: index('idx_daily_class_id').on(table.classId),
    classIdsIdx: index('idx_daily_class_ids').using('gin', table.classIds),
    columnIdIdx: index('idx_daily_column_id').on(table.columnId),
  };
});

export type DailyScheduleSchema = typeof dailySchedule.$inferSelect;
export type NewDailyScheduleSchema = typeof dailySchedule.$inferInsert;
