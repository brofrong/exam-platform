CREATE TABLE "support_message" (
	"id" text PRIMARY KEY,
	"thread_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_thread" (
	"id" text PRIMARY KEY,
	"student_user_id" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_thread_id_support_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "support_thread"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "support_thread" ADD CONSTRAINT "support_thread_student_user_id_user_id_fkey" FOREIGN KEY ("student_user_id") REFERENCES "user"("id") ON DELETE CASCADE;