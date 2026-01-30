import { pgTable, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { schools } from './schools';

export const logs = pgTable('logs', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    schoolId: text('school_id').references(() => schools.id),
    user: text('user'), // Name of the user (Google manager or teacher)
    description: text('description').notNull(),
    metadata: jsonb('metadata'),
    timeStamp: timestamp('time_stamp').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        schoolIdIdx: index('idx_logs_school_id').on(table.schoolId),
        timeStampIdx: index('idx_logs_time_stamp').on(table.timeStamp),
    };
});

export type LogSchema = typeof logs.$inferSelect;
export type NewLogSchema = typeof logs.$inferInsert;
