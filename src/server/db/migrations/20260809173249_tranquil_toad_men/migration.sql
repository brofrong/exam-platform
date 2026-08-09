CREATE TABLE "lesson_lock_edge" (
	"id" text PRIMARY KEY,
	"program_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"blocker_lesson_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	CONSTRAINT "lesson_lock_edge_topic_blocker_lesson_uidx" UNIQUE("topic_id","blocker_lesson_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "topic_lock_edge" (
	"id" text PRIMARY KEY,
	"program_id" text NOT NULL,
	"blocker_topic_id" text NOT NULL,
	"topic_id" text NOT NULL,
	CONSTRAINT "topic_lock_edge_blocker_topic_uidx" UNIQUE("blocker_topic_id","topic_id")
);
--> statement-breakpoint
ALTER TABLE "program" ADD COLUMN "topic_lock_mode" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "program" ADD COLUMN "lesson_lock_mode" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "program" ADD COLUMN "unlock_threshold_percent" integer DEFAULT 80 NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_lock_edge" ADD CONSTRAINT "lesson_lock_edge_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_lock_edge" ADD CONSTRAINT "lesson_lock_edge_topic_id_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_lock_edge" ADD CONSTRAINT "lesson_lock_edge_blocker_lesson_id_lesson_id_fkey" FOREIGN KEY ("blocker_lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_lock_edge" ADD CONSTRAINT "lesson_lock_edge_lesson_id_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_lock_edge" ADD CONSTRAINT "topic_lock_edge_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_lock_edge" ADD CONSTRAINT "topic_lock_edge_blocker_topic_id_topic_id_fkey" FOREIGN KEY ("blocker_topic_id") REFERENCES "topic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_lock_edge" ADD CONSTRAINT "topic_lock_edge_topic_id_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE;