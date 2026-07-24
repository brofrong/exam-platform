export type InviteSnapshot = {
	usedAt: Date | number | null;
	usedByUserId: string | null;
	expiresAt: Date | number | null;
};

export type ActivateDecision =
	| { type: "activate" }
	| { type: "already_active" }
	| { type: "error"; code: "not_found" | "expired" | "already_used" };

function toMillis(value: Date | number | null | undefined): number | null {
	if (value == null) {
		return null;
	}
	if (value instanceof Date) {
		return value.getTime();
	}
	return value;
}

/**
 * Pure decision for invite activation.
 * Same user reusing a consumed token → soft success (`already_active`).
 * Another user / unused expired → error.
 */
export function decideInviteActivation(
	invite: InviteSnapshot | null,
	userId: string,
	now: number = Date.now(),
): ActivateDecision {
	if (!invite) {
		return { type: "error", code: "not_found" };
	}

	const usedAt = toMillis(invite.usedAt);
	if (usedAt != null) {
		if (invite.usedByUserId === userId) {
			return { type: "already_active" };
		}
		return { type: "error", code: "already_used" };
	}

	const expiresAt = toMillis(invite.expiresAt);
	if (expiresAt != null && expiresAt <= now) {
		return { type: "error", code: "expired" };
	}

	return { type: "activate" };
}

export type EnrollmentRow = {
	id: string;
	userId: string;
	programId: string;
};

/** Build enrollment rows for every program linked to an invite. */
export function buildEnrollmentRows(
	userId: string,
	programIds: readonly string[],
	newId: () => string = () => crypto.randomUUID(),
): EnrollmentRow[] {
	return programIds.map((programId) => ({
		id: newId(),
		userId,
		programId,
	}));
}
