import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "../user/user.schema";

export const chatsTable = pgTable("chat", {
	id: uuid().primaryKey().defaultRandom().notNull(),
	title: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	createdBy: text()
		.references(() => usersTable.id)
		.notNull(),
});
