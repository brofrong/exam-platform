DROP TABLE IF EXISTS "post";
--> statement-breakpoint
DROP TABLE IF EXISTS "message";
--> statement-breakpoint
DROP TABLE IF EXISTS "chat";
--> statement-breakpoint
DROP TABLE IF EXISTS "users";
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"login" varchar(255) NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdBy" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"authorId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_createdBy_users_id_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id");
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_chatId_chat_id_fkey" FOREIGN KEY ("chatId") REFERENCES "chat"("id");
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_authorId_users_id_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id");
