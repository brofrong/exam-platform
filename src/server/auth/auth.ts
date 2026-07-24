import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { account, session, verification } from "#/server/db/auth/auth.schema";
import { betterAuthSecret, db } from "#/server/db/db";
import { usersTable } from "#/server/db/user/user.schema";
import { env } from "#/shared/env";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: usersTable,
			session,
			account,
			verification,
		},
	}),
	secret: betterAuthSecret,
	baseURL: env.APP_URL,
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			role: {
				type: ["admin", "student"],
				required: false,
				defaultValue: "student",
				input: false,
			},
		},
	},
	plugins: [tanstackStartCookies()],
});
