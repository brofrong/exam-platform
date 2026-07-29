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

type DbCache = typeof globalThis & {
	__examPlatformDb?: ReturnType<typeof drizzle>;
	__examPlatformDbInit?: Promise<string>;
};

// Cache DB setup in globalThis to survive Vite SSR HMR reloads
// without leaking connection pools or re-running bootstrap work.
const globalDb = globalThis as DbCache;

if (!globalDb.__examPlatformDb) {
	globalDb.__examPlatformDb = drizzle(env.ZERO_UPSTREAM_DB, { relations });
}

export const db = globalDb.__examPlatformDb;

if (!globalDb.__examPlatformDbInit) {
	globalDb.__examPlatformDbInit = (async () => {
		await migrate(db, { migrationsFolder: resolveMigrationsFolder() });
		return ensureAppSettings(db);
	})();
}

export const betterAuthSecret = await globalDb.__examPlatformDbInit;

export const dbProvider = zeroDrizzle(schema, db);

// Register global types for mutators on the server
declare module "@rocicorp/zero" {
	interface DefaultTypes {
		dbProvider: typeof dbProvider;
	}
}
