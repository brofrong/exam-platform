import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type { db } from "#/server/db/db";
import { appSettingsTable } from "#/server/db/setting/setting.schema";
import { env } from "#/shared/env";

export const BETTER_AUTH_SECRET_KEY = "BETTER_AUTH_SECRET";

function generateSecret(): string {
	return randomBytes(32).toString("base64");
}

/**
 * Prefer `BETTER_AUTH_SECRET` from env (required for multi-instance).
 * Fall back to generating once and persisting in `app_setting` for local DX.
 */
export async function ensureAppSettings(database: typeof db): Promise<string> {
	if (env.BETTER_AUTH_SECRET) {
		return env.BETTER_AUTH_SECRET;
	}

	const existing = await database
		.select({ value: appSettingsTable.value })
		.from(appSettingsTable)
		.where(eq(appSettingsTable.key, BETTER_AUTH_SECRET_KEY))
		.limit(1);

	if (existing[0]?.value) {
		return existing[0].value;
	}

	const value = generateSecret();
	await database.insert(appSettingsTable).values({
		key: BETTER_AUTH_SECRET_KEY,
		value,
	});
	return value;
}
