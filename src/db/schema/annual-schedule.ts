import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { classes } from './classes';
import { subjects } from './subjects';
import { teachers } from './teachers';

export const annualSchedule = pgTable('annual_schedule', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  day: integer('day').notNull(), // 1-7 representing days of the week
  hour: integer('hour').notNull(),
  schoolId: text('school_id').notNull(),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    teacherIdIdx: index('idx_annual_teacher_id_day').on(table.teacherId, table.day),
    schoolIdIdx: index('idx_annual_school_id').on(table.schoolId),
    classIdIdx: index('idx_annual_class_id').on(table.classId),
    subjectIdIdx: index('idx_annual_subject_id').on(table.subjectId),
  };
});

export type AnnualScheduleSchema = typeof annualSchedule.$inferSelect;
export type NewAnnualScheduleSchema = typeof annualSchedule.$inferInsert;
