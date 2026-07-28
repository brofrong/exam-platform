import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	/** Normalized login for Better Auth username plugin */
	username: text("username").unique(),
	/** Original (display) login before normalization */
	displayUsername: text("display_username"),
	/** `admin` | `student` — see `#/shared/authz` */
	role: text("role").default("student").notNull(),
	/** Pref: notify when teacher replies in support chat (delivery TBD) */
	notifySupportReply: boolean("notify_support_reply").default(true).notNull(),
	/** Pref: notify when a submission is graded (delivery TBD) */
	notifyReviewGraded: boolean("notify_review_graded").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
