import { pgTable, text, timestamp, integer, index, date } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const history = pgTable('history', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    schoolId: text('school_id').notNull(),
    date: date('date').notNull(),
    day: integer('day').notNull(),                          // day of week 1-7
    hour: integer('hour').notNull(),                        // hour of day 1-12
    columnId: text('column_id').notNull(),
    columnPosition: integer('column_position').notNull(),   // e.g. 1000, 2000, 3000
    columnType: integer('column_type').notNull(),           // 0 - missingTeacher, 1 - existingTeacher, 2 - event
    originalTeacher: text('original_teacher'),
    classes: text('classes'),
    subject: text('subject'),
    subTeacher: text('sub_teacher'),
    instructions: text('instructions'),
    eventTitle: text('event_title'),
    eventText: text('event'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        schoolIdDateIdx: index('idx_history_school_date').on(table.schoolId, table.date),
    };
});

export type HistorySchema = typeof history.$inferSelect;
export type NewHistorySchema = typeof history.$inferInsert;