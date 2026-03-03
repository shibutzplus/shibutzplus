ALTER TABLE "annual_schedule_alternate" RENAME TO "annual_schedule_alt";--> statement-breakpoint
ALTER TABLE "annual_schedule_alt" DROP CONSTRAINT "annual_schedule_alternate_school_id_schools_id_fk";
--> statement-breakpoint
ALTER TABLE "annual_schedule_alt" DROP CONSTRAINT "annual_schedule_alternate_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "annual_schedule_alt" DROP CONSTRAINT "annual_schedule_alternate_teacher_id_teachers_id_fk";
--> statement-breakpoint
ALTER TABLE "annual_schedule_alt" DROP CONSTRAINT "annual_schedule_alternate_subject_id_subjects_id_fk";
--> statement-breakpoint
DROP INDEX "idx_alt_annual_class_id";--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "display_alt_schedule" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "annual_schedule_alt" ADD CONSTRAINT "annual_schedule_alt_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule_alt" ADD CONSTRAINT "annual_schedule_alt_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule_alt" ADD CONSTRAINT "annual_schedule_alt_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annual_schedule_alt" ADD CONSTRAINT "annual_schedule_alt_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_alt_annual_school_class_day_hour" ON "annual_schedule_alt" USING btree ("school_id","class_id","day","hour");