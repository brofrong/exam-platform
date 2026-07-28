import { pgTable, text } from "drizzle-orm/pg-core";
import { programsTable } from "#/server/db/program/program.schema";
import { topicsTable } from "#/server/db/topic/topic.schema";

/** `draft` | `published` */
export type LessonStatus = "draft" | "published";

/**
 * Reusable lesson — linked to topics via `topic_lesson`.
 * Optional home program/topic are for search/filter; not exclusive ownership.
 */
export const lessonsTable = pgTable("lesson", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	/** `draft` | `published` — see `LessonStatus` */
	status: text("status").default("draft").notNull(),
	homeProgramId: text("home_program_id").references(() => programsTable.id, {
		onDelete: "set null",
	}),
	homeTopicId: text("home_topic_id").references(() => topicsTable.id, {
		onDelete: "set null",
	}),
});
