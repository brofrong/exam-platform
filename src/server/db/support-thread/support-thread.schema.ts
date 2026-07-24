import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "#/server/db/user/user.schema";

export const supportThreadsTable = pgTable("support_thread", {
	id: text("id").primaryKey(),
	studentUserId: text("student_user_id")
		.notNull()
		.unique()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
