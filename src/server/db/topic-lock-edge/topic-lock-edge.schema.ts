import { pgTable, text, unique } from "drizzle-orm/pg-core";
import { programsTable } from "#/server/db/program/program.schema";
import { topicsTable } from "#/server/db/topic/topic.schema";

/** Custom graph edge: blockerTopic must reach threshold before topic unlocks. */
export const topicLockEdgesTable = pgTable(
	"topic_lock_edge",
	{
		id: text("id").primaryKey(),
		programId: text("program_id")
			.notNull()
			.references(() => programsTable.id, { onDelete: "cascade" }),
		blockerTopicId: text("blocker_topic_id")
			.notNull()
			.references(() => topicsTable.id, { onDelete: "cascade" }),
		topicId: text("topic_id")
			.notNull()
			.references(() => topicsTable.id, { onDelete: "cascade" }),
	},
	(table) => [
		unique("topic_lock_edge_blocker_topic_uidx").on(
			table.blockerTopicId,
			table.topicId,
		),
	],
);
