import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { chatsTable } from "../chat/chat.schema";
import { usersTable } from "../user/user.schema";

export const messagesTable = pgTable("message", {
	id: uuid().primaryKey().defaultRandom().notNull(),
	chatId: uuid()
		.references(() => chatsTable.id)
		.notNull(),
	authorId: text()
		.references(() => usersTable.id)
		.notNull(),
	content: text().notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
