import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { activitiesTable } from "#/server/db/activity/activity.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { usersTable } from "#/server/db/user/user.schema";
import type { GradedAnswers } from "#/server/grading/grade-submission";

/** `pending` | `graded` */
export type SubmissionStatus = "pending" | "graded";

export type SubmissionAnswers = GradedAnswers;

export const submissionsTable = pgTable("submission", {
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
	answers: jsonb("answers").$type<SubmissionAnswers>().notNull(),
	/** `pending` | `graded` — see `SubmissionStatus` */
	status: text("status").notNull(),
	reviewedBy: text("reviewed_by").references(() => usersTable.id, {
		onDelete: "set null",
	}),
	reviewerComment: text("reviewer_comment"),
	reviewedAt: timestamp("reviewed_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
