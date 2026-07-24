import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "#/server/db/user/user.schema";

export const programInvitesTable = pgTable("program_invite", {
	id: text("id").primaryKey(),
	token: text("token").notNull().unique(),
	createdByUserId: text("created_by_user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	inviteeEmail: text("invitee_email"),
	inviteeName: text("invitee_name"),
	expiresAt: timestamp("expires_at"),
	usedAt: timestamp("used_at"),
	usedByUserId: text("used_by_user_id").references(() => usersTable.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
