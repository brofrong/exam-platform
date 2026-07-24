import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { programsTable } from "#/server/db/program/program.schema";
import { programInvitesTable } from "#/server/db/program-invite/program-invite.schema";

/** M2M: programs granted by a one-time invite. */
export const programInviteProgramsTable = pgTable(
	"program_invite_program",
	{
		inviteId: text("invite_id")
			.notNull()
			.references(() => programInvitesTable.id, { onDelete: "cascade" }),
		programId: text("program_id")
			.notNull()
			.references(() => programsTable.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.inviteId, table.programId] })],
);
