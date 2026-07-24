CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"program_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "enrollment_user_id_program_id_uidx" UNIQUE("user_id","program_id")
);
--> statement-breakpoint
CREATE TABLE "program_invite_program" (
	"invite_id" text,
	"program_id" text,
	CONSTRAINT "program_invite_program_pkey" PRIMARY KEY("invite_id","program_id")
);
--> statement-breakpoint
CREATE TABLE "program_invite" (
	"id" text PRIMARY KEY,
	"token" text NOT NULL UNIQUE,
	"created_by_user_id" text NOT NULL,
	"invitee_email" text,
	"invitee_name" text,
	"expires_at" timestamp,
	"used_at" timestamp,
	"used_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "program_invite_program" ADD CONSTRAINT "program_invite_program_invite_id_program_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "program_invite"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "program_invite_program" ADD CONSTRAINT "program_invite_program_program_id_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "program_invite" ADD CONSTRAINT "program_invite_created_by_user_id_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "program_invite" ADD CONSTRAINT "program_invite_used_by_user_id_user_id_fkey" FOREIGN KEY ("used_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL;