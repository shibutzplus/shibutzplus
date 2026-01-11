DROP INDEX "idx_daily_issue_teacher_date_hour";--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD COLUMN "original_teacher_id" text;--> statement-breakpoint
CREATE INDEX "idx_daily_issue_teacher_date_hour" ON "daily_schedule" USING btree ("original_teacher_id","date","hour");--> statement-breakpoint
ALTER TABLE "daily_schedule" DROP COLUMN "issue_teacher_id";