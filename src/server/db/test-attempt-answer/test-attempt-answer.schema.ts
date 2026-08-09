import {
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { testsTable } from "#/server/db/test/test.schema";
import { testAttemptsTable } from "#/server/db/test-attempt/test-attempt.schema";
import { usersTable } from "#/server/db/user/user.schema";
import type { GradedAnswer } from "#/server/grading/grade-attempt";

/** Per-test answer row within an attempt (PK attemptId + testId). */
export const testAttemptAnswersTable = pgTable(
	"test_attempt_answer",
	{
		attemptId: text("attempt_id")
			.notNull()
			.references(() => testAttemptsTable.id, { onDelete: "cascade" }),
		testId: text("test_id")
			.notNull()
			.references(() => testsTable.id, { onDelete: "cascade" }),
		/** Student answer + result (correct/incorrect/pending). */
		answer: jsonb("answer").$type<GradedAnswer>().notNull(),
		/** Denormalized from answer.result for filtering/stats. */
		result: text("result").notNull(),
		reviewedBy: text("reviewed_by").references(() => usersTable.id, {
			onDelete: "set null",
		}),
		reviewerComment: text("reviewer_comment"),
		reviewedAt: timestamp("reviewed_at"),
	},
	(table) => [
		primaryKey({
			columns: [table.attemptId, table.testId],
		}),
	],
);
