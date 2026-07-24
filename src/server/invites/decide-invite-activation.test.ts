import { describe, expect, test } from "bun:test";
import {
	buildEnrollmentRows,
	decideInviteActivation,
} from "#/server/invites/decide-invite-activation";

const NOW = Date.parse("2026-07-24T12:00:00.000Z");
const USER_A = "user-a";
const USER_B = "user-b";

describe("decideInviteActivation", () => {
	test("activates unused unexpired invite", () => {
		const decision = decideInviteActivation(
			{
				usedAt: null,
				usedByUserId: null,
				expiresAt: NOW + 60_000,
			},
			USER_A,
			NOW,
		);
		expect(decision).toEqual({ type: "activate" });
	});

	test("rejects reused token for another user", () => {
		const decision = decideInviteActivation(
			{
				usedAt: NOW - 1_000,
				usedByUserId: USER_A,
				expiresAt: null,
			},
			USER_B,
			NOW,
		);
		expect(decision).toEqual({ type: "error", code: "already_used" });
	});

	test("soft-succeeds when same user reuses token", () => {
		const decision = decideInviteActivation(
			{
				usedAt: NOW - 1_000,
				usedByUserId: USER_A,
				expiresAt: null,
			},
			USER_A,
			NOW,
		);
		expect(decision).toEqual({ type: "already_active" });
	});

	test("rejects expired unused invite", () => {
		const decision = decideInviteActivation(
			{
				usedAt: null,
				usedByUserId: null,
				expiresAt: NOW - 1,
			},
			USER_A,
			NOW,
		);
		expect(decision).toEqual({ type: "error", code: "expired" });
	});

	test("rejects missing invite", () => {
		expect(decideInviteActivation(null, USER_A, NOW)).toEqual({
			type: "error",
			code: "not_found",
		});
	});
});

describe("buildEnrollmentRows", () => {
	test("creates one enrollment per program (multi-program invite)", () => {
		let n = 0;
		const rows = buildEnrollmentRows(
			USER_A,
			["prog-1", "prog-2", "prog-3"],
			() => `enr-${++n}`,
		);
		expect(rows).toEqual([
			{ id: "enr-1", userId: USER_A, programId: "prog-1" },
			{ id: "enr-2", userId: USER_A, programId: "prog-2" },
			{ id: "enr-3", userId: USER_A, programId: "prog-3" },
		]);
	});
});
