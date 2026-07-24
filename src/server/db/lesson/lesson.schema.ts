import { pgTable, text } from "drizzle-orm/pg-core";

/** `draft` | `published` */
export type LessonStatus = "draft" | "published";

/** Standalone reusable lesson — linked to topics via `topic_lesson`. */
export const lessonsTable = pgTable("lesson", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	/** `draft` | `published` — see `LessonStatus` */
	status: text("status").default("draft").notNull(),
});
