import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { inArray } from "drizzle-orm";
import {
	buildSeedRows,
	summarizeSeedRows,
} from "#/features/admin-seed/lib/build-seed-rows";
import { DEMO_PROGRAM_IDS } from "#/features/admin-seed/lib/catalog";
import { authenticateRequest } from "#/server/auth/authenticate-request";
import { activitiesTable } from "#/server/db/activity/activity.schema";
import { db } from "#/server/db/db";
import { lessonsTable } from "#/server/db/lesson/lesson.schema";
import { programsTable } from "#/server/db/program/program.schema";
import { testsTable } from "#/server/db/test/test.schema";
import { testGroupsTable } from "#/server/db/test-group/test-group.schema";
import { testKeysTable } from "#/server/db/test-key/test-key.schema";
import { topicsTable } from "#/server/db/topic/topic.schema";
import { topicLessonsTable } from "#/server/db/topic-lesson/topic-lesson.schema";
import { can } from "#/shared/authz";

export type SeedDemoCatalogResult =
	| {
			status: "created";
			programs: number;
			topics: number;
			lessons: number;
			activities: number;
	  }
	| { status: "already_exists" }
	| { status: "forbidden" }
	| { status: "unauthenticated" };

async function insertChunked<T extends Record<string, unknown>>(
	insert: (chunk: T[]) => Promise<unknown>,
	rows: T[],
	chunkSize: number,
): Promise<void> {
	for (let i = 0; i < rows.length; i += chunkSize) {
		await insert(rows.slice(i, i + chunkSize));
	}
}

/**
 * Idempotent demo catalog seed: 4 ОГЭ/ЕГЭ programs with topics, lessons,
 * theory (Mafs) + practice activities. All published.
 */
export const seedDemoCatalog = createServerFn({ method: "POST" }).handler(
	async (): Promise<SeedDemoCatalogResult> => {
		const user = await authenticateRequest(getRequest());
		if (!user) {
			return { status: "unauthenticated" };
		}
		if (!can(user.role, "program:write")) {
			return { status: "forbidden" };
		}

		const existing = await db
			.select({ id: programsTable.id })
			.from(programsTable)
			.where(inArray(programsTable.id, [...DEMO_PROGRAM_IDS]));

		if (existing.length === DEMO_PROGRAM_IDS.length) {
			return { status: "already_exists" };
		}
		if (existing.length > 0) {
			// Partial leftover — treat as already seeded to avoid duplicates.
			return { status: "already_exists" };
		}

		const rows = buildSeedRows();
		const summary = summarizeSeedRows(rows);

		await db.transaction(async (tx) => {
			await insertChunked(
				(chunk) => tx.insert(programsTable).values(chunk),
				rows.programs,
				50,
			);
			await insertChunked(
				(chunk) => tx.insert(topicsTable).values(chunk),
				rows.topics,
				100,
			);
			await insertChunked(
				(chunk) => tx.insert(lessonsTable).values(chunk),
				rows.lessons,
				100,
			);
			await insertChunked(
				(chunk) => tx.insert(topicLessonsTable).values(chunk),
				rows.topicLessons,
				200,
			);
			await insertChunked(
				(chunk) => tx.insert(testGroupsTable).values(chunk),
				rows.testGroups,
				100,
			);
			await insertChunked(
				(chunk) => tx.insert(testsTable).values(chunk),
				rows.tests,
				100,
			);
			await insertChunked(
				(chunk) => tx.insert(testKeysTable).values(chunk),
				rows.testKeys,
				100,
			);
			await insertChunked(
				(chunk) => tx.insert(activitiesTable).values(chunk),
				rows.activities,
				25,
			);
		});

		return { status: "created", ...summary };
	},
);
