ALTER TABLE "lesson" ADD COLUMN "home_program_id" text;--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "home_topic_id" text;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_home_program_id_program_id_fkey" FOREIGN KEY ("home_program_id") REFERENCES "program"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_home_topic_id_topic_id_fkey" FOREIGN KEY ("home_topic_id") REFERENCES "topic"("id") ON DELETE SET NULL;--> statement-breakpoint
UPDATE "lesson" AS l
SET
	"home_topic_id" = first_link.topic_id,
	"home_program_id" = first_link.program_id
FROM (
	SELECT DISTINCT ON (tl.lesson_id)
		tl.lesson_id,
		tl.topic_id,
		t.program_id
	FROM "topic_lesson" AS tl
	INNER JOIN "topic" AS t ON t.id = tl.topic_id
	ORDER BY tl.lesson_id, tl.position ASC
) AS first_link
WHERE l.id = first_link.lesson_id
	AND l.home_topic_id IS NULL
	AND l.home_program_id IS NULL;
