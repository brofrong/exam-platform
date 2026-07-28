ALTER TABLE "user" ADD COLUMN "notify_support_reply" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notify_review_graded" boolean DEFAULT true NOT NULL;