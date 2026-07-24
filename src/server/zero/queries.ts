import { defineQueries, defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { MESSAGE_PAGE_SIZE } from "./constants";
import { zql } from "./schema";

const messageCursorSchema = z.object({
	createdAt: z.number(),
	id: z.string(),
});

/**
 * DEMO: queries are intentionally open among authenticated users.
 * See `./authz.demo.ts` for membership-scoped replacements.
 */
export const queries = defineQueries({
	allChats: defineQuery(() => {
		// DEMO OPEN AUTHZ: every signed-in user sees every chat.
		// Production: filter by ownership or membership (see authz.demo.ts).
		return zql.chat.orderBy("createdAt", "desc");
	}),

	chatMessagePage: defineQuery(
		z.object({
			chatId: z.string(),
			cursor: messageCursorSchema.optional(),
		}),
		({ args: { chatId, cursor } }) => {
			// DEMO OPEN AUTHZ: any signed-in user can page any chatId.
			// Production: assert membership for chatId before returning.
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
