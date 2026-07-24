import { existsSync } from "node:fs";
import { join } from "node:path";
import { zeroDrizzle } from "@rocicorp/zero/server/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { relations } from "#/server/db/relations";
import { ensureAppSettings } from "#/server/db/setting/ensure-settings";
import { schema } from "#/server/zero/schema";
import { env } from "#/shared/env";

export const db = drizzle(env.ZERO_UPSTREAM_DB, { relations });

/**
 * Prefer the source tree path (works for `bun run start` after build).
 * Fall back to a path next to this module (Docker copies migrations there).
 */
function resolveMigrationsFolder(): string {
	const fromCwd = join(process.cwd(), "src/server/db/migrations");
	if (existsSync(fromCwd)) {
		return fromCwd;
	}
	const fromModule = join(import.meta.dirname, "migrations");
	if (existsSync(fromModule)) {
		return fromModule;
	}
	return fromCwd;
}

await migrate(db, {
	migrationsFolder: resolveMigrationsFolder(),
});

export const betterAuthSecret = await ensureAppSettings(db);

export const dbProvider = zeroDrizzle(schema, db);

// Register global types for mutators on the server
declare module "@rocicorp/zero" {
	interface DefaultTypes {
		dbProvider: typeof dbProvider;
	}
}
