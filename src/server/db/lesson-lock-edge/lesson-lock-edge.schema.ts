import { pgTable, text, unique } from "drizzle-orm/pg-core";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { topicsTable } from "#/server/db/topic/topic.schema";

/** Custom graph edge within a topic: blockerLesson unlocks lesson. */
export const lessonLockEdgesTable = pgTable(
	"lesson_lock_edge",
	{
		id: text("id").primaryKey(),
		programId: text("program_id")
			.notNull()
			.references(() => programsTable.id, { onDelete: "cascade" }),
		topicId: text("topic_id")
			.notNull()
			.references(() => topicsTable.id, { onDelete: "cascade" }),
		blockerLessonId: text("blocker_lesson_id")
			.notNull()
			.references(() => lessonsTable.id, { onDelete: "cascade" }),
		lessonId: text("lesson_id")
			.notNull()
			.references(() => lessonsTable.id, { onDelete: "cascade" }),
	},
	(table) => [
		unique("lesson_lock_edge_topic_blocker_lesson_uidx").on(
			table.topicId,
			table.blockerLessonId,
			table.lessonId,
		),
	],
);
