import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { TestCorrectAnswer } from "#/server/db/test/test.schema";
import { testsTable } from "#/server/db/test/test.schema";

/**
 * Answer keys live in a separate table so student Zero queries on `test`
 * never sync `correctAnswer`.
 */
export const testKeysTable = pgTable("test_key", {
	testId: text("test_id")
		.primaryKey()
		.references(() => testsTable.id, { onDelete: "cascade" }),
	correctAnswer: jsonb("correct_answer").$type<TestCorrectAnswer>(),
});
