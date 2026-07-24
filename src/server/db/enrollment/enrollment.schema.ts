import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { programsTable } from "#/server/db/program/program.schema";
import { usersTable } from "#/server/db/user/user.schema";

export const enrollmentsTable = pgTable(
	"enrollment",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		programId: text("program_id")
			.notNull()
			.references(() => programsTable.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		unique("enrollment_user_id_program_id_uidx").on(
			table.userId,
			table.programId,
		),
	],
);
