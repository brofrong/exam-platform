import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { programsTable } from "#/server/db/program/program.schema";

/** `draft` | `published` */
export type TopicStatus = "draft" | "published";

export const topicsTable = pgTable("topic", {
	id: text("id").primaryKey(),
	programId: text("program_id")
		.notNull()
		.references(() => programsTable.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	position: integer("position").notNull(),
	/** `draft` | `published` — see `TopicStatus` */
	status: text("status").default("draft").notNull(),
});
