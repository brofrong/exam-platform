/**
 * DEMO AUTHORIZATION (intentionally open)
 * --------------------------------------
 * The starter chat demo lets any authenticated user list all chats and send
 * messages to any `chatId`. That keeps the multi-user sync demo simple.
 *
 * Do NOT copy this into a real product. Scope queries/mutators to membership
 * (or ownership) before shipping. Example membership-shaped patterns:
 *
 *   // Query only chats the user created (ownership):
 *   // zql.chat.where("createdBy", ctx.id).orderBy("createdAt", "desc")
 *
 *   // Query only chats the user belongs to (membership table):
 *   // zql.chatMember
 *   //   .where("userId", ctx.id)
 *   //   .related("chat")
 *
 *   // Mutator: refuse writes unless the user is a member / creator:
 *   // const chat = await tx.query.chat.where("id", chatId).one()
 *   // if (!chat || chat.createdBy !== ctx.id) throw new Error("Forbidden")
 *
 * Wire real authz in `queries.ts` / `mutators.ts` when you leave demo mode.
 */
export {};
