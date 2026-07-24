import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** `draft` | `published` */
export type ProgramStatus = "draft" | "published";

export const programsTable = pgTable("program", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	examType: text("exam_type").notNull(),
	subject: text("subject").notNull(),
	/** `draft` | `published` — see `ProgramStatus` */
	status: text("status").default("draft").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
