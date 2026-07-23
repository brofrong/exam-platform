import { defineRelations } from "drizzle-orm";
import { chatsTable } from "#/server/db/chat/chat.schema";
import { messagesTable } from "#/server/db/message/message.schema";
import { usersTable } from "#/server/db/user/user.schema";

const DrizzleSchema = {
	user: usersTable,
	chat: chatsTable,
	message: messagesTable,
};

export const relations = defineRelations(DrizzleSchema, (r) => ({
	user: {
		chats: r.many.chat(),
		messages: r.many.message(),
	},
	chat: {
		creator: r.one.user({
			from: r.chat.createdBy,
			to: r.user.id,
		}),
		messages: r.many.message(),
	},
	message: {
		chat: r.one.chat({
			from: r.message.chatId,
			to: r.chat.id,
		}),
		author: r.one.user({
			from: r.message.authorId,
			to: r.user.id,
		}),
	},
}));
