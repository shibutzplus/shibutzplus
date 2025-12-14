import { pgTable, text, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const subjects = pgTable('subjects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  schoolId: text('school_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  activity: boolean('activity').default(false).notNull(),
}, (table) => {
  return {
    schoolIdNameIdx: index('idx_subjects_school_id_name').on(table.schoolId, table.name),
  };
});

export type SubjectSchema = typeof subjects.$inferSelect;
export type NewSubjectSchema = typeof subjects.$inferInsert;
