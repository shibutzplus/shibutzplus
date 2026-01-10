CREATE TABLE "history" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"date" date NOT NULL,
	"day" integer NOT NULL,
	"hour" integer NOT NULL,
	"column_id" text NOT NULL,
	"column_position" integer NOT NULL,
	"column_type" integer NOT NULL,
	"original_teacher" text,
	"classes" text,
	"subject" text,
	"sub_teacher" text,
	"instructions" text,
	"event_title" text,
	"event" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "settings" CASCADE;--> statement-breakpoint
DROP INDEX "idx_annual_teacher_id";--> statement-breakpoint
DROP INDEX "idx_daily_issue_teacher_id";--> statement-breakpoint
DROP INDEX "idx_daily_sub_teacher_id";--> statement-breakpoint
DROP INDEX "idx_daily_class_id";--> statement-breakpoint
DROP INDEX "idx_daily_column_id";--> statement-breakpoint
DROP INDEX "idx_teachers_school_id_name";--> statement-breakpoint
ALTER TABLE "daily_schedule" ALTER COLUMN "day" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "daily_schedule" ALTER COLUMN "event_title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "daily_schedule" RENAME COLUMN "issue_teacher_type" TO "column_type";--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD COLUMN "class_ids" text[];--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "city" varchar(50);--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "hours_num" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "display_schedule2susb" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_history_school_date" ON "history" USING btree ("school_id","date");--> statement-breakpoint
CREATE INDEX "idx_annual_teacher_id_day" ON "annual_schedule" USING btree ("teacher_id","day");--> statement-breakpoint
CREATE INDEX "idx_annual_school_id" ON "annual_schedule" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_classes_school_id_name" ON "classes" USING btree ("school_id","name");--> statement-breakpoint
CREATE INDEX "idx_classes_school_id_activity_name" ON "classes" USING btree ("school_id","activity","name");--> statement-breakpoint
CREATE INDEX "idx_daily_issue_teacher_date_hour" ON "daily_schedule" USING btree ("issue_teacher_id","date","hour");--> statement-breakpoint
CREATE INDEX "idx_daily_sub_teacher_date_hour" ON "daily_schedule" USING btree ("sub_teacher_id","date","hour");--> statement-breakpoint
CREATE INDEX "idx_daily_school_date_column" ON "daily_schedule" USING btree ("school_id","date","column_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_subjects_school_id_name" ON "subjects" USING btree ("school_id","name");--> statement-breakpoint
CREATE INDEX "idx_users_school_id" ON "users" USING btree ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_teachers_school_id_name" ON "teachers" USING btree ("school_id","name");--> statement-breakpoint
ALTER TABLE "daily_schedule" DROP COLUMN "class_id";--> statement-breakpoint