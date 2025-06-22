import { pgTable, text, varchar, timestamp, integer, uniqueIndex, date } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const dailySchedule = pgTable('daily_schedule', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  date: date('date').notNull(),
  hour: integer('hour').notNull(), // period number
  position: varchar('position', { length: 30 }).notNull(), // YYYY-MM-DD + '-hour' + hour
  eventTitle: varchar('event_title', { length: 255 }),
  event: text('event'),
  schoolId: text('school_id').notNull(),
  classId: text('class_id').notNull(),
  subjectId: text('subject_id'),
  absentTeacherId: text('absent_teacher_id'),
  presentTeacherId: text('present_teacher_id'),
  subTeacherId: text('sub_teacher_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    positionIdx: uniqueIndex('daily_position_idx').on(table.schoolId, table.position),
  };
});

export type DailyScheduleSchema = typeof dailySchedule.$inferSelect;
export type NewDailyScheduleSchema = typeof dailySchedule.$inferInsert;
