import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { supportThreadsTable } from "#/server/db/support-thread/support-thread.schema";
import { usersTable } from "#/server/db/user/user.schema";

export const supportMessagesTable = pgTable("support_message", {
	id: text("id").primaryKey(),
	threadId: text("thread_id")
		.notNull()
		.references(() => supportThreadsTable.id, { onDelete: "cascade" }),
	authorId: text("author_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	body: text("body").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
