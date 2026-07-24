import { defineMutator, defineMutators } from "@rocicorp/zero";
import { z } from "zod";

export const mutators = defineMutators({
	createChat: defineMutator(
		z.object({ id: z.string(), title: z.string().min(1).max(255) }),
		async ({ ctx, args: { id, title }, tx }) => {
			if (!ctx?.id) {
				throw new Error("Unauthorized");
			}
			await tx.mutate.chat.insert({
				id,
				title,
				createdBy: ctx.id,
				createdAt: Date.now(),
			});
		},
	),

	sendMessage: defineMutator(
		z.object({
			id: z.string(),
			chatId: z.string(),
			content: z.string().min(1).max(4000),
		}),
		async ({ ctx, args: { id, chatId, content }, tx }) => {
			if (!ctx?.id) {
				throw new Error("Unauthorized");
			}
			await tx.mutate.message.insert({
				id,
				chatId,
				authorId: ctx.id,
				content,
				createdAt: Date.now(),
			});
		},
	),
});
