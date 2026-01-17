import { pgTable, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { AuthType, UserGender, UserRole } from "@/models/types/auth";

export const users = pgTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().$type<UserRole>().default("guest"),
    gender: varchar("gender", { length: 20 }).notNull().$type<UserGender>().default("female"),
    authType: varchar("auth_type", { length: 20 }).notNull().$type<AuthType>().default("google"),
    schoolId: text("school_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        schoolIdIdx: index("idx_users_school_id").on(table.schoolId),
    };
});

export type UserSchema = typeof users.$inferSelect;
export type NewUserSchema = typeof users.$inferInsert;
