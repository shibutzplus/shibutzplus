import { pgTable, text, varchar, timestamp, boolean, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { TeacherRole } from '@/models/types/teachers';
import { schools } from './schools';

export const teachers = pgTable('teachers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().$type<TeacherRole>(),
  schoolId: text('school_id').notNull().references(() => schools.id),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    schoolIdNameIdx: uniqueIndex('idx_teachers_school_id_name').on(table.schoolId, table.name),
    schoolIdRoleIdx: index('idx_teachers_school_role').on(table.schoolId, table.role),
    schoolIdIsActiveIdx: index('idx_teachers_school_is_active').on(table.schoolId, table.isActive),
  };
});

export type TeacherSchema = typeof teachers.$inferSelect;
export type NewTeacherSchema = typeof teachers.$inferInsert;
