import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { ensureFirstAdmin } from "#/server/auth/ensure-first-admin";
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
		changeEmail: {
			enabled: true,
			updateEmailWithoutVerification: true,
		},
		additionalFields: {
			role: {
				type: ["admin", "teacher", "student"],
				required: false,
				defaultValue: "student",
				input: false,
			},
			notifySupportReply: {
				type: "boolean",
				required: false,
				defaultValue: true,
				input: true,
			},
			notifyReviewGraded: {
				type: "boolean",
				required: false,
				defaultValue: true,
				input: true,
			},
		},
	},
	plugins: [username(), tanstackStartCookies()],
});

type AuthBootstrapCache = typeof globalThis & {
	__examPlatformEnsureAdmin?: Promise<void>;
};

const authBootstrap = globalThis as AuthBootstrapCache;
if (!authBootstrap.__examPlatformEnsureAdmin) {
	authBootstrap.__examPlatformEnsureAdmin = ensureFirstAdmin(auth);
}
await authBootstrap.__examPlatformEnsureAdmin;
