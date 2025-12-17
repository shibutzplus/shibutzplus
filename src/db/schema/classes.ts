import { pgTable, text, varchar, timestamp, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2';

export const classes = pgTable('classes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  schoolId: text('school_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  activity: boolean('activity').default(false).notNull(),
}, (table) => {
  return {
    schoolIdNameIdx: uniqueIndex('idx_classes_school_id_name').on(table.schoolId, table.name),
  };
});

export type ClassSchema = typeof classes.$inferSelect;
export type NewClassSchema = typeof classes.$inferInsert;
