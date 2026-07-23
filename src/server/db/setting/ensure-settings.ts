import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type { db } from "#/server/db/db";
import { appSettingsTable } from "#/server/db/setting/setting.schema";

export const BETTER_AUTH_SECRET_KEY = "BETTER_AUTH_SECRET";

function generateSecret(): string {
	return randomBytes(32).toString("base64");
}

/** Ensure required app settings exist; generate BETTER_AUTH_SECRET if missing. */
export async function ensureAppSettings(database: typeof db): Promise<string> {
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
