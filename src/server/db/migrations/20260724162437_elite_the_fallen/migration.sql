CREATE TABLE "activity" (
	"id" text PRIMARY KEY,
	"lesson_id" text NOT NULL,
	"type" text NOT NULL,
	"position" integer NOT NULL,
	"content" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text,
	"exam_type" text NOT NULL,
	"subject" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_lesson" (
	"topic_id" text,
	"lesson_id" text,
	"position" integer NOT NULL,
	CONSTRAINT "topic_lesson_pkey" PRIMARY KEY("topic_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "topic" (
	"id" text PRIMARY KEY,
	"program_id" text NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_lesson_id_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_lesson" ADD CONSTRAINT "topic_lesson_topic_id_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_lesson" ADD CONSTRAINT "topic_lesson_lesson_id_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;