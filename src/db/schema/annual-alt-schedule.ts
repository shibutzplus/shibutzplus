import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { classes } from './classes';
import { subjects } from './subjects';
import { teachers } from './teachers';
import { schools } from './schools';

export const annualScheduleAlt = pgTable('annual_schedule_alt', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    day: integer('day').notNull(), // 1-7 representing days of the week
    hour: integer('hour').notNull(),
    schoolId: text('school_id').notNull().references(() => schools.id),
    classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
    subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        schoolIdIdx: index('idx_alt_annual_school_id').on(table.schoolId),
        schoolClassDayHourIdx: index('idx_alt_annual_school_class_day_hour').on(table.schoolId, table.classId, table.day, table.hour),
        teacherIdIdx: index('idx_alt_annual_teacher_id_day').on(table.teacherId, table.day),
        subjectIdIdx: index('idx_alt_annual_subject_id').on(table.subjectId),
    };
});

export type AnnualScheduleAltSchema = typeof annualScheduleAlt.$inferSelect;
export type NewAnnualScheduleAltSchema = typeof annualScheduleAlt.$inferInsert;
