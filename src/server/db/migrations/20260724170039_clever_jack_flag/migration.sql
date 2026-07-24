CREATE TABLE "activity_progress" (
	"user_id" text,
	"program_id" text,
	"activity_id" text,
	"status" text NOT NULL,
	"video_position_sec" integer,
	"video_percent" double precision,
	"completed_at" timestamp,
	CONSTRAINT "activity_progress_pkey" PRIMARY KEY("user_id","program_id","activity_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"user_id" text,
	"program_id" text,
	"lesson_id" text,
	"status" text NOT NULL,
	"percent" double precision NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "lesson_progress_pkey" PRIMARY KEY("user_id","program_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "submission" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"program_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"answers" jsonb NOT NULL,
	"status" text NOT NULL,
	"reviewed_by" text,
	"reviewer_comment" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_progress" ADD CONSTRAINT "activity_progress_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "activity_progress" ADD CONSTRAINT "activity_progress_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "activity_progress" ADD CONSTRAINT "activity_progress_activity_id_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_activity_id_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL;