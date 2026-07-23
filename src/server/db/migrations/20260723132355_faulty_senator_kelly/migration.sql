CREATE TABLE "app_setting" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
