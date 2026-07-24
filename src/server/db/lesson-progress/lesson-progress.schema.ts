import {
	doublePrecision,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { usersTable } from "#/server/db/user/user.schema";

/** `not_started` | `in_progress` | `completed` */
export type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export const lessonProgressTable = pgTable(
	"lesson_progress",
	{
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		programId: text("program_id")
			.notNull()
			.references(() => programsTable.id, { onDelete: "cascade" }),
		lessonId: text("lesson_id")
			.notNull()
			.references(() => lessonsTable.id, { onDelete: "cascade" }),
		/** `not_started` | `in_progress` | `completed` */
		status: text("status").notNull(),
		percent: doublePrecision("percent").notNull(),
		completedAt: timestamp("completed_at"),
	},
	(table) => [
		primaryKey({
			columns: [table.userId, table.programId, table.lessonId],
		}),
	],
);
