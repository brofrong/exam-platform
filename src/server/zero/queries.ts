import { defineQueries, defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { MESSAGE_PAGE_SIZE } from "#/features/chat/lib/pagination";
import { zql } from "./schema";

const messageCursorSchema = z.object({
	createdAt: z.number(),
	id: z.string(),
});

export const queries = defineQueries({
	allChats: defineQuery(() => {
		return zql.chat.orderBy("createdAt", "desc");
	}),

	chatMessagePage: defineQuery(
		z.object({
			chatId: z.string(),
			cursor: messageCursorSchema.optional(),
		}),
		({ args: { chatId, cursor } }) => {
			let query = zql.message
				.where("chatId", chatId)
				.orderBy("createdAt", "desc")
				.orderBy("id", "desc")
				.limit(MESSAGE_PAGE_SIZE)
				.related("author");

			if (cursor) {
				query = query.start(cursor);
			}

			return query;
		},
	),
});
