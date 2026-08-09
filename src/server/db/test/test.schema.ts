import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { testGroupsTable } from "#/server/db/test-group/test-group.schema";

/** Answer kinds stored on `test.answer_type`. */
export type TestAnswerType =
	| "single_choice"
	| "multiple_choice"
	| "short_text"
	| "number"
	| "file_upload";

/** `auto` | `manual` — file_upload is always manual. */
export type TestGrading = "auto" | "manual";

/** TipTap document JSON for the question prompt. */
export type TestPrompt = Record<string, unknown>;

/** Choice options when answerType is single/multiple choice. */
export type TestOptions = Array<{ id: string; label: string }>;

/**
 * Correct answer payload:
 * - short_text / number → string
 * - single_choice → option id string
 * - multiple_choice → option id string[]
 * - file_upload → null
 */
export type TestCorrectAnswer = string | string[] | null;

export const testsTable = pgTable("test", {
	id: text("id").primaryKey(),
	groupId: text("group_id")
		.notNull()
		.references(() => testGroupsTable.id, { onDelete: "cascade" }),
	position: integer("position").notNull(),
	prompt: jsonb("prompt").$type<TestPrompt>().notNull(),
	/** See `TestAnswerType` */
	answerType: text("answer_type").notNull(),
	options: jsonb("options").$type<TestOptions | null>(),
	/** `auto` | `manual` — see `TestGrading`. Answer key lives in `test_key`. */
	grading: text("grading").notNull(),
});
