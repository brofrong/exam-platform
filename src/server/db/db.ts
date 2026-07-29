import { existsSync } from "node:fs";
import { join } from "node:path";
import { zeroDrizzle } from "@rocicorp/zero/server/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { relations } from "#/server/db/relations";
import { ensureAppSettings } from "#/server/db/setting/ensure-settings";
import { schema } from "#/server/zero/schema";
import { env } from "#/shared/env";

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

// Cache DB instance in globalThis to survive Vite SSR HMR reloads
// without leaking connection pools.
const globalDb = globalThis as unknown as {
	__db?: ReturnType<typeof drizzle>;
	__dbMigrated?: boolean;
	__betterAuthSecret?: string;
};

if (!globalDb.__db) {
	globalDb.__db = drizzle(env.ZERO_UPSTREAM_DB, { relations });
}

export const db = globalDb.__db;

if (!globalDb.__dbMigrated) {
	await migrate(db, { migrationsFolder: resolveMigrationsFolder() });
	globalDb.__dbMigrated = true;
}

if (!globalDb.__betterAuthSecret) {
	globalDb.__betterAuthSecret = await ensureAppSettings(db);
}

export const betterAuthSecret = globalDb.__betterAuthSecret;

export const dbProvider = zeroDrizzle(schema, db);

// Register global types for mutators on the server
declare module "@rocicorp/zero" {
	interface DefaultTypes {
		dbProvider: typeof dbProvider;
	}
}
