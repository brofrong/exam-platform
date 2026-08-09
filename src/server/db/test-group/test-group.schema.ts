import { pgTable, text } from "drizzle-orm/pg-core";

/** `draft` | `published` */
export type TestGroupStatus = "draft" | "published";

/**
 * Reusable bank of tests (questions) that lessons sample from.
 */
export const testGroupsTable = pgTable("test_group", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull().default(""),
	/** `draft` | `published` — see `TestGroupStatus` */
	status: text("status").default("draft").notNull(),
});
