CREATE TABLE IF NOT EXISTS "test_key" (
	"test_id" text PRIMARY KEY,
	"correct_answer" jsonb
);
--> statement-breakpoint
ALTER TABLE "test" DROP COLUMN IF EXISTS "correct_answer";--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "test_key" ADD CONSTRAINT "test_key_test_id_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "test"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;