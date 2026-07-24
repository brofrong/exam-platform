import { eq } from "drizzle-orm";
import { db } from "#/server/db/db";
import { enrollmentsTable } from "#/server/db/enrollment/enrollment.schema";
import { programInvitesTable } from "#/server/db/program-invite/program-invite.schema";
import { programInviteProgramsTable } from "#/server/db/program-invite/program-invite-program.schema";
import {
	buildEnrollmentRows,
	decideInviteActivation,
} from "#/server/invites/decide-invite-activation";

export type ActivateInviteResult =
	| { ok: true; soft: boolean; programIds: string[] }
	| {
			ok: false;
			code: "not_found" | "expired" | "already_used";
			message: string;
	  };

const ERROR_MESSAGES = {
	not_found: "Ссылка не найдена",
	expired: "Срок действия ссылки истёк",
	already_used: "Ссылка уже использована",
} as const;

/**
 * Atomically consume a one-time invite and upsert enrollments for all linked programs.
 */
export async function activateInvite(
	token: string,
	userId: string,
	now: Date = new Date(),
): Promise<ActivateInviteResult> {
	return db.transaction(async (tx) => {
		const [invite] = await tx
			.select()
			.from(programInvitesTable)
			.where(eq(programInvitesTable.token, token))
			.for("update");

		const decision = decideInviteActivation(
			invite ?? null,
			userId,
			now.getTime(),
		);

		if (decision.type === "error") {
			return {
				ok: false as const,
				code: decision.code,
				message: ERROR_MESSAGES[decision.code],
			};
		}

		const links = await tx
			.select({ programId: programInviteProgramsTable.programId })
			.from(programInviteProgramsTable)
			.where(eq(programInviteProgramsTable.inviteId, invite.id));

		const programIds = links.map((link) => link.programId);

		if (decision.type === "already_active") {
			return { ok: true as const, soft: true, programIds };
		}

		await tx
			.update(programInvitesTable)
			.set({
				usedAt: now,
				usedByUserId: userId,
			})
			.where(eq(programInvitesTable.id, invite.id));

		const rows = buildEnrollmentRows(userId, programIds);
		if (rows.length > 0) {
			await tx
				.insert(enrollmentsTable)
				.values(
					rows.map((row) => ({
						id: row.id,
						userId: row.userId,
						programId: row.programId,
						createdAt: now,
					})),
				)
				.onConflictDoNothing({
					target: [enrollmentsTable.userId, enrollmentsTable.programId],
				});
		}

		return { ok: true as const, soft: false, programIds };
	});
}
