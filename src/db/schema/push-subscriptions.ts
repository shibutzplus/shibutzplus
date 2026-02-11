/**
 * Push Subscriptions Schema
 * Stores who subscribed to push notifications.
 * Each subscription represents a device/browser registered to receive push notifications.
 */
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { schools } from "./schools";

export const pushSubscriptions = pgTable("push_subscriptions", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    principalId: text("principal_id").references(() => users.id, { onDelete: "cascade" }), // (principals/admins - Private Portal Users)
    teacherId: text("teacher_id"), // (public portal users - Teachers)
    schoolId: text("school_id").references(() => schools.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsed: timestamp("last_used"),
}, (table) => {
    return {
        teacherIdIdx: index("idx_push_subscriptions_teacher_id").on(table.teacherId),
        schoolIdIdx: index("idx_push_subscriptions_school_id").on(table.schoolId),
        endpointIdx: index("idx_push_subscriptions_endpoint").on(table.endpoint),
    };
});

export type PushSubscriptionSchema = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscriptionSchema = typeof pushSubscriptions.$inferInsert;
