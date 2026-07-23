import { chatsTable } from "#/server/db/chat/chat.schema";
import { messagesTable } from "#/server/db/message/message.schema";
import { usersTable } from "./user/user.schema";

export { chatsTable as chat } from "#/server/db/chat/chat.schema";
export { messagesTable as message } from "#/server/db/message/message.schema";
export { relations } from "./relations";
export { usersTable as user } from "./user/user.schema";

/** App tables for Zero / drizzle-zero. Auth tables are wired only in betterAuth. */
export const DrizzleSchema = {
	user: usersTable,
	chat: chatsTable,
	message: messagesTable,
};
