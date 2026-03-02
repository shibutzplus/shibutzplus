CREATE TABLE "annual_schedule_alternate" (
	"id" text PRIMARY KEY NOT NULL,
	"day" integer NOT NULL,
	"hour" integer NOT NULL,
	"school_id" text NOT NULL,
	"class_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text,
	"user" text,
	"description" text NOT NULL,
	"metadata" jsonb,
	"time_stamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text,
	"school_id" text,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_schedule" ALTER COLUMN "day" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "daily_schedule" ALTER COLUMN "column_type" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'guest';--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "from_hour" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "to_hour" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "annual_schedule_alternate" ADD CONSTRAINT "annual_schedule_alternate_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule_alternate" ADD CONSTRAINT "annual_schedule_alternate_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule_alternate" ADD CONSTRAINT "annual_schedule_alternate_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule_alternate" ADD CONSTRAINT "annual_schedule_alternate_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_alt_annual_teacher_id_day" ON "annual_schedule_alternate" USING btree ("teacher_id","day");--> statement-breakpoint
CREATE INDEX "idx_alt_annual_school_id" ON "annual_schedule_alternate" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_alt_annual_class_id" ON "annual_schedule_alternate" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "idx_alt_annual_subject_id" ON "annual_schedule_alternate" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "idx_logs_school_id" ON "logs" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_logs_time_stamp" ON "logs" USING btree ("time_stamp");--> statement-breakpoint
CREATE INDEX "idx_push_subscriptions_teacher_id" ON "push_subscriptions" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_push_subscriptions_school_id" ON "push_subscriptions" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_push_subscriptions_endpoint" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
ALTER TABLE "annual_schedule" ADD CONSTRAINT "annual_schedule_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule" ADD CONSTRAINT "annual_schedule_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule" ADD CONSTRAINT "annual_schedule_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule" ADD CONSTRAINT "annual_schedule_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD CONSTRAINT "daily_schedule_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD CONSTRAINT "daily_schedule_original_teacher_id_teachers_id_fk" FOREIGN KEY ("original_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD CONSTRAINT "daily_schedule_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD CONSTRAINT "daily_schedule_sub_teacher_id_teachers_id_fk" FOREIGN KEY ("sub_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_daily_subject_id" ON "daily_schedule" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "idx_history_school_stats" ON "history" USING btree ("school_id","column_type","date");--> statement-breakpoint
CREATE INDEX "idx_history_recommendations" ON "history" USING btree ("school_id","day","hour");--> statement-breakpoint
CREATE INDEX "idx_history_search_optimized" ON "history" USING btree ("school_id","day","hour","original_teacher","sub_teacher");--> statement-breakpoint
CREATE INDEX "idx_teachers_school_role" ON "teachers" USING btree ("school_id","role");--> statement-breakpoint
ALTER TABLE "schools" DROP COLUMN "hours_num";--> statement-breakpoint
ALTER TABLE "teachers" DROP COLUMN "user_id";