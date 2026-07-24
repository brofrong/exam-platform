import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";

/** `theory` | `practice` */
export type ActivityType = "theory" | "practice";

/** TipTap document JSON stored on the activity. */
export type ActivityContent = Record<string, unknown>;

export const activitiesTable = pgTable("activity", {
	id: text("id").primaryKey(),
	lessonId: text("lesson_id")
		.notNull()
		.references(() => lessonsTable.id, { onDelete: "cascade" }),
	/** `theory` | `practice` — see `ActivityType` */
	type: text("type").notNull(),
	position: integer("position").notNull(),
	content: jsonb("content").$type<ActivityContent>().notNull(),
});
