-- Update existing tables

-- Update schools table
ALTER TABLE "schools" 
  ALTER COLUMN "status" SET DEFAULT 'onboarding',
  ALTER COLUMN "status" TYPE varchar(20);

-- Update users table
ALTER TABLE "users" 
  DROP COLUMN "name",
  ADD COLUMN "name" varchar(255) NOT NULL,
  ADD COLUMN "gender" varchar(20) NOT NULL DEFAULT 'female',
  ALTER COLUMN "role" TYPE varchar(20),
  ALTER COLUMN "role" SET DEFAULT 'admin';

-- Update teachers table
ALTER TABLE "teachers" 
  ADD COLUMN "school_id" text NOT NULL,
  ADD COLUMN "user_id" text,
  DROP COLUMN "name",
  DROP COLUMN "subject",
  DROP COLUMN "notes",
  ALTER COLUMN "role" TYPE varchar(20);

-- Update classes table
ALTER TABLE "classes" 
  DROP COLUMN "class_teacher_id";

-- Add foreign key from teachers to schools
ALTER TABLE "teachers" 
  ADD CONSTRAINT "teachers_school_id_schools_id_fk" 
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key from teachers to users (optional relationship)
ALTER TABLE "teachers" 
  ADD CONSTRAINT "teachers_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Create new tables

-- Create subjects table
CREATE TABLE "subjects" (
  "id" text PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "school_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "subjects_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create annual_schedule table
CREATE TABLE "annual_schedule" (
  "id" text PRIMARY KEY NOT NULL,
  "day" integer NOT NULL,
  "hour" integer NOT NULL,
  "position" varchar(20) NOT NULL,
  "school_id" text NOT NULL,
  "class_id" text NOT NULL,
  "teacher_id" text NOT NULL,
  "subject_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "annual_schedule_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "annual_schedule_class_id_fk" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "annual_schedule_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "annual_schedule_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "annual_schedule_school_position_unique" UNIQUE("school_id", "position")
);

-- Create daily_schedule table
CREATE TABLE "daily_schedule" (
  "id" text PRIMARY KEY NOT NULL,
  "date" date NOT NULL,
  "hour" integer NOT NULL,
  "position" varchar(30) NOT NULL,
  "event_title" varchar(255),
  "event" text,
  "school_id" text NOT NULL,
  "class_id" text NOT NULL,
  "subject_id" text,
  "absent_teacher_id" text,
  "present_teacher_id" text,
  "sub_teacher_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "daily_schedule_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "daily_schedule_class_id_fk" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "daily_schedule_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "daily_schedule_absent_teacher_id_fk" FOREIGN KEY ("absent_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "daily_schedule_present_teacher_id_fk" FOREIGN KEY ("present_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "daily_schedule_sub_teacher_id_fk" FOREIGN KEY ("sub_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "daily_schedule_school_position_unique" UNIQUE("school_id", "position")
);

-- Drop tables that are no longer needed
DROP TABLE IF EXISTS "teachers_to_classes";
DROP TABLE IF EXISTS "schools_to_teachers";
DROP TABLE IF EXISTS "schools_to_professions";
DROP TABLE IF EXISTS "professions";
