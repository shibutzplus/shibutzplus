ALTER TABLE "daily_schedule" ALTER COLUMN "class_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD COLUMN "column_id" text;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD COLUMN "position" integer NOT NULL;