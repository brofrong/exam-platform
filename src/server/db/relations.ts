import { defineRelations } from "drizzle-orm";
import { account, session } from "#/server/db/auth/auth.schema";
import { chatsTable } from "#/server/db/chat/chat.schema";
import { messagesTable } from "#/server/db/message/message.schema";
import { usersTable } from "#/server/db/user/user.schema";

const DrizzleSchema = {
	user: usersTable,
	session,
	account,
	chat: chatsTable,
	message: messagesTable,
};

export const relations = defineRelations(DrizzleSchema, (r) => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
		chats: r.many.chat(),
		messages: r.many.message(),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
		}),
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
