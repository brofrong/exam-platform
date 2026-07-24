import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";
import { topicsTable } from "#/server/db/topic/topic.schema";

/** M2M: lesson placement and order within a topic. */
export const topicLessonsTable = pgTable(
	"topic_lesson",
	{
		topicId: text("topic_id")
			.notNull()
			.references(() => topicsTable.id, { onDelete: "cascade" }),
		lessonId: text("lesson_id")
			.notNull()
			.references(() => lessonsTable.id, { onDelete: "cascade" }),
		position: integer("position").notNull(),
	},
	(table) => [primaryKey({ columns: [table.topicId, table.lessonId] })],
);
