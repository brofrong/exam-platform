CREATE TABLE "test_attempt_answer" (
	"attempt_id" text,
	"test_id" text,
	"answer" jsonb NOT NULL,
	"result" text NOT NULL,
	"reviewed_by" text,
	"reviewer_comment" text,
	"reviewed_at" timestamp,
	CONSTRAINT "test_attempt_answer_pkey" PRIMARY KEY("attempt_id","test_id")
);
--> statement-breakpoint
CREATE TABLE "test_attempt" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"program_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"test_ids" jsonb NOT NULL,
	"status" text NOT NULL,
	"score_percent" integer,
	"passed" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_group" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test" (
	"id" text PRIMARY KEY,
	"group_id" text NOT NULL,
	"position" integer NOT NULL,
	"prompt" jsonb NOT NULL,
	"answer_type" text NOT NULL,
	"options" jsonb,
	"grading" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_key" (
	"test_id" text PRIMARY KEY,
	"correct_answer" jsonb
);
--> statement-breakpoint
DROP TABLE "submission";--> statement-breakpoint
DELETE FROM "activity_progress" WHERE "activity_id" IN (SELECT "id" FROM "activity" WHERE "type" = 'practice');--> statement-breakpoint
DELETE FROM "activity" WHERE "type" = 'practice';--> statement-breakpoint
ALTER TABLE "test_attempt_answer" ADD CONSTRAINT "test_attempt_answer_attempt_id_test_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "test_attempt"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "test_attempt_answer" ADD CONSTRAINT "test_attempt_answer_test_id_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "test_attempt_answer" ADD CONSTRAINT "test_attempt_answer_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "test_attempt" ADD CONSTRAINT "test_attempt_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "test_attempt" ADD CONSTRAINT "test_attempt_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "test_attempt" ADD CONSTRAINT "test_attempt_activity_id_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "test" ADD CONSTRAINT "test_group_id_test_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "test_group"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "test_key" ADD CONSTRAINT "test_key_test_id_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE CASCADE;