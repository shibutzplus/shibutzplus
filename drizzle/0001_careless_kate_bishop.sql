DROP INDEX "daily_position_idx";--> statement-breakpoint
DROP INDEX "annual_position_idx";--> statement-breakpoint
ALTER TABLE "daily_schedule" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD COLUMN "day" varchar(20) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_date_hour_idx" ON "daily_schedule" USING btree ("school_id","date","hour","class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_day_hour_idx" ON "daily_schedule" USING btree ("school_id","day","hour","class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "annual_position_idx" ON "annual_schedule" USING btree ("school_id","day","hour","class_id");