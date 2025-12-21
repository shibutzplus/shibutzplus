import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const annualSchedule = pgTable('annual_schedule', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  day: integer('day').notNull(), // 1-7 representing days of the week
  hour: integer('hour').notNull(),
  schoolId: text('school_id').notNull(),
  classId: text('class_id').notNull(),
  teacherId: text('teacher_id').notNull(),
  subjectId: text('subject_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    teacherIdIdx: index('idx_annual_teacher_id').on(table.teacherId),
    schoolIdIdx: index('idx_annual_school_id').on(table.schoolId),
    classIdIdx: index('idx_annual_class_id').on(table.classId),
    subjectIdIdx: index('idx_annual_subject_id').on(table.subjectId),
  };
});

export type AnnualScheduleSchema = typeof annualSchedule.$inferSelect;
export type NewAnnualScheduleSchema = typeof annualSchedule.$inferInsert;
