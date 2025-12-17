import { pgTable, text, varchar, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { TeacherRole } from '@/models/types/teachers';

export const teachers = pgTable('teachers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().$type<TeacherRole>(),
  schoolId: text('school_id').notNull(),
  userId: text('user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    schoolIdNameIdx: uniqueIndex('idx_teachers_school_id_name').on(table.schoolId, table.name),
  };
});

export type TeacherSchema = typeof teachers.$inferSelect;
export type NewTeacherSchema = typeof teachers.$inferInsert;
