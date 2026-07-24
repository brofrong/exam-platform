import {
	doublePrecision,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { activitiesTable } from "#/server/db/activity/activity.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { usersTable } from "#/server/db/user/user.schema";

/** `not_started` | `in_progress` | `completed` */
export type ActivityProgressStatus =
	| "not_started"
	| "in_progress"
	| "completed";

export const activityProgressTable = pgTable(
	"activity_progress",
	{
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		programId: text("program_id")
			.notNull()
			.references(() => programsTable.id, { onDelete: "cascade" }),
		activityId: text("activity_id")
			.notNull()
			.references(() => activitiesTable.id, { onDelete: "cascade" }),
		/** `not_started` | `in_progress` | `completed` */
		status: text("status").notNull(),
		videoPositionSec: integer("video_position_sec"),
		videoPercent: doublePrecision("video_percent"),
		completedAt: timestamp("completed_at"),
	},
	(table) => [
		primaryKey({
			columns: [table.userId, table.programId, table.activityId],
		}),
	],
);
