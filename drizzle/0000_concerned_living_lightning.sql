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
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"school_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) DEFAULT 'Elementary' NOT NULL,
	"status" varchar(20) DEFAULT 'onboarding' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "schools_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"school_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" varchar(50) NOT NULL,
	"school_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'admin' NOT NULL,
	"gender" varchar(20) DEFAULT 'female' NOT NULL,
	"school_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "annual_position_idx" ON "annual_schedule" USING btree ("school_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_position_idx" ON "daily_schedule" USING btree ("school_id","position");