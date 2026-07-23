import { join } from "node:path";
import { zeroDrizzle } from "@rocicorp/zero/server/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { relations } from "#/server/db/relations";
import { env } from "#/utils/env";
import { schema } from "#/zero/schema";

export const db = drizzle(env.ZERO_UPSTREAM_DB, { relations });

await migrate(db, {
	migrationsFolder: join(import.meta.dirname, "migrations"),
});

export const dbProvider = zeroDrizzle(schema, db);

// Register global types for mutators on the server
declare module "@rocicorp/zero" {
	interface DefaultTypes {
		dbProvider: typeof dbProvider;
	}
}
