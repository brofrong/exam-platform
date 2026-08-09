import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** `draft` | `published` */
export type ProgramStatus = "draft" | "published";

/** `open` | `sequential` | `graph` */
export type ProgramLockMode = "open" | "sequential" | "graph";

export const programsTable = pgTable("program", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	examType: text("exam_type").notNull(),
	subject: text("subject").notNull(),
	/** `draft` | `published` — see `ProgramStatus` */
	status: text("status").default("draft").notNull(),
	/** Public programs are visible to all authenticated users without enrollment. */
	public: boolean("public").default(false).notNull(),
	/** How topics unlock — see `ProgramLockMode` */
	topicLockMode: text("topic_lock_mode").default("open").notNull(),
	/** How lessons unlock within a topic — see `ProgramLockMode` */
	lessonLockMode: text("lesson_lock_mode").default("open").notNull(),
	/** Progress % required on blockers to unlock (1–100). */
	unlockThresholdPercent: integer("unlock_threshold_percent")
		.default(80)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
