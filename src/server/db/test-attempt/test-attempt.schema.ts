import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { activitiesTable } from "#/server/db/activity/activity.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { usersTable } from "#/server/db/user/user.schema";

/** `in_progress` | `pending_review` | `graded` */
export type TestAttemptStatus = "in_progress" | "pending_review" | "graded";

export const testAttemptsTable = pgTable("test_attempt", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	programId: text("program_id")
		.notNull()
		.references(() => programsTable.id, { onDelete: "cascade" }),
	activityId: text("activity_id")
		.notNull()
		.references(() => activitiesTable.id, { onDelete: "cascade" }),
	/** Fixed random sample of test ids for this attempt. */
	testIds: jsonb("test_ids").$type<string[]>().notNull(),
	/** See `TestAttemptStatus` */
	status: text("status").notNull(),
	scorePercent: integer("score_percent"),
	passed: boolean("passed"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
